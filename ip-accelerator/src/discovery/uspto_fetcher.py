"""Fetch patent data from the USPTO PatentsView API."""

import logging
from datetime import datetime, timedelta
from typing import Any

import requests

from src.utils.cache import FileCache
from src.utils.rate_limiter import RateLimiter

logger = logging.getLogger(__name__)

PATENTSVIEW_URL = "https://api.patentsview.org/patents/query"

FIELDS = [
    "patent_number",
    "patent_title",
    "patent_abstract",
    "patent_date",
    "patent_num_cited_by_us_patents",
    "patent_num_claims",
]
ASSIGNEE_FIELDS = ["assignee_organization"]
INVENTOR_FIELDS = ["inventor_first_name", "inventor_last_name"]
CPC_FIELDS = ["cpc_group_id", "cpc_subgroup_id"]


class USPTOFetcher:
    """Fetches university patents from USPTO PatentsView API."""

    def __init__(
        self,
        rate_limiter: RateLimiter | None = None,
        cache: FileCache | None = None,
        max_per_university: int = 200,
        date_range_years: int = 2,
    ):
        self.rate_limiter = rate_limiter or RateLimiter(calls_per_second=0.75)
        self.cache = cache or FileCache()
        self.max_per_university = max_per_university
        self.cutoff_date = (
            datetime.now() - timedelta(days=date_range_years * 365)
        ).strftime("%Y-%m-%d")

    def fetch_university_patents(self, university: str) -> list[dict[str, Any]]:
        """Fetch patents assigned to a university.

        Args:
            university: University name as it appears in USPTO assignee records.

        Returns:
            List of normalized patent records.
        """
        cache_key = f"uspto_{university}_{self.cutoff_date}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            logger.info("Cache hit for USPTO/%s (%d records)", university, len(cached))
            return cached

        all_patents = []
        page = 1
        per_page = 100

        while len(all_patents) < self.max_per_university:
            query = {
                "q": {
                    "_and": [
                        {"_contains": {"assignee_organization": university}},
                        {"_gte": {"patent_date": self.cutoff_date}},
                    ]
                },
                "f": FIELDS + ASSIGNEE_FIELDS + INVENTOR_FIELDS + CPC_FIELDS,
                "o": {"page": page, "per_page": per_page},
            }

            self.rate_limiter.wait()
            try:
                resp = requests.post(
                    PATENTSVIEW_URL, json=query, timeout=30,
                    headers={"Content-Type": "application/json"}
                )
                resp.raise_for_status()
                data = resp.json()
            except requests.RequestException as e:
                logger.warning("USPTO API error for %s page %d: %s", university, page, e)
                break

            patents = data.get("patents") or []
            if not patents:
                break

            for p in patents:
                all_patents.append(self._normalize(p, university))

            total = data.get("total_patent_count", 0)
            if page * per_page >= total or len(all_patents) >= self.max_per_university:
                break
            page += 1

        all_patents = all_patents[: self.max_per_university]
        self.cache.set(cache_key, all_patents)
        logger.info("Fetched %d patents for %s", len(all_patents), university)
        return all_patents

    @staticmethod
    def _normalize(patent: dict, university: str) -> dict[str, Any]:
        """Normalize a USPTO patent record to common schema."""
        inventors = []
        if patent.get("inventors"):
            for inv in patent["inventors"]:
                name = f"{inv.get('inventor_first_name', '')} {inv.get('inventor_last_name', '')}".strip()
                if name:
                    inventors.append(name)

        cpc_codes = []
        if patent.get("cpcs"):
            for cpc in patent["cpcs"]:
                code = cpc.get("cpc_group_id") or cpc.get("cpc_subgroup_id") or ""
                if code and code not in cpc_codes:
                    cpc_codes.append(code)

        return {
            "id": f"USPTO-{patent.get('patent_number', '')}",
            "source": "uspto",
            "title": patent.get("patent_title", ""),
            "abstract": patent.get("patent_abstract", ""),
            "institution": university,
            "authors": inventors,
            "date": patent.get("patent_date", ""),
            "domain_tags": [],
            "raw_metadata": {
                "patent_number": patent.get("patent_number"),
                "num_claims": patent.get("patent_num_claims"),
                "forward_citations": patent.get("patent_num_cited_by_us_patents", 0),
                "cpc_codes": cpc_codes,
                "assignees": [
                    a.get("assignee_organization", "")
                    for a in (patent.get("assignees") or [])
                ],
            },
        }
