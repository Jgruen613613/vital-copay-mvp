"""Fetch preprint data from the arXiv API."""

import logging
import urllib.parse
import xml.etree.ElementTree as ET
from typing import Any

import requests

from src.utils.cache import FileCache
from src.utils.rate_limiter import RateLimiter

logger = logging.getLogger(__name__)

ARXIV_API_URL = "http://export.arxiv.org/api/query"

# High-impact categories to search
CATEGORIES = ["cs.AI", "cs.LG", "q-bio", "cond-mat", "physics"]

# Keyword mapping for university affiliation search
UNIVERSITY_KEYWORDS = {
    "Massachusetts Institute of Technology": "MIT",
    "Stanford University": "Stanford",
    "California Institute of Technology": "Caltech",
    "Johns Hopkins University": "Johns Hopkins",
    "University of Michigan": "Michigan",
    "Georgia Institute of Technology": "Georgia Tech",
    "University of California Berkeley": "UC Berkeley",
    "University of Wisconsin": "Wisconsin",
    "Columbia University": "Columbia",
    "Carnegie Mellon University": "Carnegie Mellon",
}


class ArxivFetcher:
    """Fetches preprints from arXiv for university-affiliated authors."""

    def __init__(
        self,
        rate_limiter: RateLimiter | None = None,
        cache: FileCache | None = None,
        max_results: int = 100,
    ):
        self.rate_limiter = rate_limiter or RateLimiter(calls_per_second=0.33)
        self.cache = cache or FileCache()
        self.max_results = max_results

    def fetch_university_papers(self, university: str) -> list[dict[str, Any]]:
        """Fetch arXiv papers affiliated with a university.

        Args:
            university: Full university name.

        Returns:
            List of normalized paper records.
        """
        keyword = UNIVERSITY_KEYWORDS.get(university, university)
        cache_key = f"arxiv_{keyword}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            logger.info("Cache hit for arXiv/%s (%d records)", keyword, len(cached))
            return cached

        # Build query: search affiliation in author field + category filter
        cat_query = " OR ".join(f"cat:{c}" for c in CATEGORIES)
        search_query = f"au:{keyword} AND ({cat_query})"

        params = {
            "search_query": search_query,
            "start": 0,
            "max_results": self.max_results,
            "sortBy": "submittedDate",
            "sortOrder": "descending",
        }

        self.rate_limiter.wait()
        try:
            url = f"{ARXIV_API_URL}?{urllib.parse.urlencode(params)}"
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
        except requests.RequestException as e:
            logger.warning("arXiv API error for %s: %s", keyword, e)
            return []

        papers = self._parse_atom_feed(resp.text, university)

        self.cache.set(cache_key, papers)
        logger.info("Fetched %d papers for %s", len(papers), keyword)
        return papers

    @staticmethod
    def _parse_atom_feed(xml_text: str, university: str) -> list[dict[str, Any]]:
        """Parse arXiv Atom feed XML into normalized records."""
        ns = {"atom": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}
        papers = []
        try:
            root = ET.fromstring(xml_text)
        except ET.ParseError:
            return []

        for entry in root.findall("atom:entry", ns):
            entry_id = (entry.findtext("atom:id", "", ns) or "")
            arxiv_id = entry_id.split("/abs/")[-1].split("v")[0]
            title = (entry.findtext("atom:title", "", ns) or "").replace("\n", " ").strip()
            abstract = (entry.findtext("atom:summary", "", ns) or "").replace("\n", " ").strip()
            published = entry.findtext("atom:published", "", ns) or ""

            authors = []
            for author_el in entry.findall("atom:author", ns):
                name = author_el.findtext("atom:name", "", ns)
                if name:
                    authors.append(name)

            categories = []
            for cat_el in entry.findall("atom:category", ns):
                term = cat_el.get("term", "")
                if term:
                    categories.append(term)

            papers.append({
                "id": f"ARXIV-{arxiv_id}",
                "source": "arxiv",
                "title": title,
                "abstract": abstract,
                "institution": university,
                "authors": authors,
                "date": published,
                "domain_tags": categories,
                "raw_metadata": {
                    "arxiv_id": arxiv_id,
                    "categories": categories,
                    "pdf_url": entry_id,
                },
            })

        return papers
