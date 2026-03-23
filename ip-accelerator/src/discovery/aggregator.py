"""Aggregate and deduplicate IP records from all discovery sources."""

import logging
from typing import Any

from rapidfuzz import fuzz

from src.discovery.uspto_fetcher import USPTOFetcher
from src.discovery.arxiv_fetcher import ArxivFetcher
from src.discovery.nih_fetcher import NIHFetcher
from src.utils.cache import FileCache
from src.utils.rate_limiter import RateLimiter

logger = logging.getLogger(__name__)

# Keywords for basic domain tagging
DOMAIN_KEYWORDS = {
    "drug_discovery": ["drug", "pharma", "therapeutic", "clinical trial", "dosage", "pharmacol"],
    "materials_science": ["material", "alloy", "polymer", "composite", "ceramic", "coating"],
    "protein_engineering": ["protein", "enzyme", "antibody", "peptide", "biologic", "folding"],
    "semiconductor": ["semiconductor", "transistor", "chip", "wafer", "lithograph", "cmos"],
    "climate_energy": ["solar", "battery", "wind energy", "carbon capture", "catalyst", "renewable"],
    "autonomous_systems": ["robot", "autonomous", "drone", "self-driving", "navigation", "lidar"],
    "medical_diagnostics": ["diagnostic", "imaging", "biomarker", "mri", "ct scan", "ultrasound"],
    "agriculture": ["crop", "soil", "pesticide", "fertilizer", "agriculture", "plant breeding"],
    "quantum_computing": ["quantum", "qubit", "entanglement", "superposition", "quantum error"],
    "synthetic_biology": ["synthetic biology", "gene edit", "crispr", "genome", "metabolic engineer"],
    "telecom": ["5g", "antenna", "wireless", "network", "telecom", "signal processing"],
    "aerospace": ["aerospace", "satellite", "propulsion", "orbit", "spacecraft", "aerodynamic"],
    "ai_ml": ["machine learning", "neural network", "deep learning", "artificial intelligence", "nlp", "computer vision"],
    "cybersecurity": ["cybersecurity", "encryption", "malware", "intrusion", "authentication"],
    "financial": ["financial model", "portfolio", "risk model", "algorithmic trading", "fintech"],
}


def tag_domains(text: str) -> list[str]:
    """Assign domain tags based on keyword matching.

    Args:
        text: Combined title + abstract text.

    Returns:
        List of matched domain tag strings.
    """
    text_lower = text.lower()
    tags = []
    for domain, keywords in DOMAIN_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                tags.append(domain)
                break
    return tags if tags else ["general"]


class Aggregator:
    """Aggregates IP records from USPTO, arXiv, and NIH sources."""

    def __init__(
        self,
        universities: list[str],
        cache: FileCache | None = None,
        rate_limiter: RateLimiter | None = None,
        max_patents: int = 200,
        arxiv_max: int = 100,
        date_range_years: int = 2,
    ):
        self.universities = universities
        rl = rate_limiter or RateLimiter(calls_per_second=0.33)
        c = cache or FileCache()

        self.uspto = USPTOFetcher(
            rate_limiter=rl, cache=c,
            max_per_university=max_patents, date_range_years=date_range_years,
        )
        self.arxiv = ArxivFetcher(rate_limiter=rl, cache=c, max_results=arxiv_max)
        self.nih = NIHFetcher(rate_limiter=rl, cache=c, max_results=arxiv_max)

    def discover_all(self) -> list[dict[str, Any]]:
        """Run discovery across all sources and universities.

        Returns:
            Deduplicated list of IP records with domain tags.
        """
        all_records: list[dict[str, Any]] = []

        for uni in self.universities:
            logger.info("Discovering IP for %s...", uni)

            # USPTO
            try:
                patents = self.uspto.fetch_university_patents(uni)
                all_records.extend(patents)
            except Exception as e:
                logger.error("USPTO fetch failed for %s: %s", uni, e)

            # arXiv
            try:
                papers = self.arxiv.fetch_university_papers(uni)
                all_records.extend(papers)
            except Exception as e:
                logger.error("arXiv fetch failed for %s: %s", uni, e)

            # NIH
            try:
                grants = self.nih.fetch_university_grants(uni)
                all_records.extend(grants)
            except Exception as e:
                logger.error("NIH fetch failed for %s: %s", uni, e)

        # Tag domains
        for rec in all_records:
            text = f"{rec.get('title', '')} {rec.get('abstract', '')}"
            rec["domain_tags"] = tag_domains(text)

        # Deduplicate
        deduped = self._deduplicate(all_records)
        logger.info(
            "Discovery complete: %d raw → %d deduplicated records",
            len(all_records), len(deduped),
        )
        return deduped

    @staticmethod
    def _deduplicate(records: list[dict], threshold: int = 85) -> list[dict]:
        """Remove duplicate records using fuzzy title matching.

        Args:
            records: List of IP records.
            threshold: Minimum fuzzy match ratio to consider duplicate.

        Returns:
            Deduplicated list.
        """
        seen_titles: list[str] = []
        unique: list[dict] = []

        for rec in records:
            title = rec.get("title", "").strip().lower()
            if not title:
                unique.append(rec)
                continue

            is_dup = False
            for seen in seen_titles:
                if fuzz.ratio(title, seen) >= threshold:
                    is_dup = True
                    break

            if not is_dup:
                seen_titles.append(title)
                unique.append(rec)

        return unique
