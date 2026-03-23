"""Fetch grant data from the NIH RePORTER API."""

import logging
from typing import Any

import requests

from src.utils.cache import FileCache
from src.utils.rate_limiter import RateLimiter

logger = logging.getLogger(__name__)

NIH_REPORTER_URL = "https://api.reporter.nih.gov/v2/projects/search"


class NIHFetcher:
    """Fetches active grants from NIH RePORTER for target universities."""

    def __init__(
        self,
        rate_limiter: RateLimiter | None = None,
        cache: FileCache | None = None,
        max_results: int = 100,
    ):
        self.rate_limiter = rate_limiter or RateLimiter(calls_per_second=0.5)
        self.cache = cache or FileCache()
        self.max_results = max_results

    def fetch_university_grants(self, university: str) -> list[dict[str, Any]]:
        """Fetch active NIH grants for a university.

        Args:
            university: University name.

        Returns:
            List of normalized grant records.
        """
        cache_key = f"nih_{university}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            logger.info("Cache hit for NIH/%s (%d records)", university, len(cached))
            return cached

        payload = {
            "criteria": {
                "org_names": [university],
                "is_active": True,
            },
            "offset": 0,
            "limit": self.max_results,
            "sort_field": "project_start_date",
            "sort_order": "desc",
        }

        self.rate_limiter.wait()
        try:
            resp = requests.post(
                NIH_REPORTER_URL, json=payload, timeout=30,
                headers={"Content-Type": "application/json"}
            )
            resp.raise_for_status()
            data = resp.json()
        except requests.RequestException as e:
            logger.warning("NIH RePORTER API error for %s: %s", university, e)
            return []

        results = data.get("results") or []
        grants = [self._normalize(r, university) for r in results]

        self.cache.set(cache_key, grants)
        logger.info("Fetched %d grants for %s", len(grants), university)
        return grants

    @staticmethod
    def _normalize(grant: dict, university: str) -> dict[str, Any]:
        """Normalize an NIH grant record to common schema."""
        pis = []
        for pi in grant.get("principal_investigators") or []:
            name = pi.get("full_name") or ""
            if not name:
                first = pi.get("first_name", "")
                last = pi.get("last_name", "")
                name = f"{first} {last}".strip()
            if name:
                pis.append(name)

        terms = grant.get("terms") or ""
        domain_tags = [t.strip() for t in terms.split(";") if t.strip()][:10]

        return {
            "id": f"NIH-{grant.get('project_num', grant.get('appl_id', ''))}",
            "source": "nih",
            "title": grant.get("project_title", "").strip(),
            "abstract": (grant.get("abstract_text") or "").strip(),
            "institution": university,
            "authors": pis,
            "date": grant.get("project_start_date", ""),
            "domain_tags": domain_tags,
            "raw_metadata": {
                "project_num": grant.get("project_num"),
                "activity_code": grant.get("activity_code"),
                "award_amount": grant.get("award_amount"),
                "project_start_date": grant.get("project_start_date"),
                "project_end_date": grant.get("project_end_date"),
                "spending_categories": grant.get("spending_categories"),
                "organization": grant.get("organization", {}).get("org_name", ""),
            },
        }
