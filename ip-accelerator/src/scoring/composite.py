"""Composite scorer — combines all 10 dimensions into a weighted score."""

import logging
from typing import Any

from src.scoring.technical_novelty import score_technical_novelty
from src.scoring.market_size import score_market_size
from src.scoring.citation_momentum import score_citation_momentum
from src.scoring.inventor_quality import score_inventor_quality, build_inventor_stats
from src.scoring.dimensions import (
    score_defensibility,
    score_trl,
    score_competitive_landscape,
    score_fto_risk,
    score_patent_life,
    score_licensing_complexity,
)

logger = logging.getLogger(__name__)

DEFAULT_WEIGHTS = {
    "technical_novelty": 0.15,
    "defensibility": 0.10,
    "market_size": 0.15,
    "trl": 0.10,
    "competitive_landscape": 0.10,
    "citation_momentum": 0.10,
    "inventor_quality": 0.05,
    "fto_risk": 0.10,
    "patent_life": 0.05,
    "licensing_complexity": 0.10,
}


class CompositeScorer:
    """Scores IP records across 10 dimensions and produces a composite score."""

    def __init__(self, weights: dict[str, float] | None = None):
        """Initialize with scoring weights.

        Args:
            weights: Dict mapping dimension name to weight (should sum to 1.0).
        """
        self.weights = weights or DEFAULT_WEIGHTS

    def score_all(self, records: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Score all records on every dimension.

        Args:
            records: List of IP records from discovery.

        Returns:
            List of records augmented with dimension_scores, composite_score,
            and confidence_level.
        """
        if not records:
            return []

        logger.info("Scoring %d records across 10 dimensions...", len(records))

        # Batch compute technical novelty (needs full corpus)
        novelty_scores = score_technical_novelty(records)

        # Build inventor stats from the corpus
        inventor_stats = build_inventor_stats(records)

        scored = []
        for rec in records:
            dims = {
                "technical_novelty": novelty_scores.get(rec["id"], 5.0),
                "defensibility": score_defensibility(rec),
                "market_size": score_market_size(rec),
                "trl": score_trl(rec),
                "competitive_landscape": score_competitive_landscape(rec, records),
                "citation_momentum": score_citation_momentum(rec),
                "inventor_quality": score_inventor_quality(rec, inventor_stats),
                "fto_risk": score_fto_risk(rec, records),
                "patent_life": score_patent_life(rec),
                "licensing_complexity": score_licensing_complexity(rec),
            }

            composite = sum(
                dims[dim] * self.weights.get(dim, 0.1)
                for dim in dims
            )

            # Confidence based on data completeness
            has_abstract = bool(rec.get("abstract", "").strip())
            has_metadata = bool(rec.get("raw_metadata", {}))
            confidence = "high" if has_abstract and has_metadata else "medium"
            if not has_abstract:
                confidence = "low"

            rec_copy = dict(rec)
            rec_copy["dimension_scores"] = dims
            rec_copy["composite_score"] = round(composite, 2)
            rec_copy["confidence_level"] = confidence
            scored.append(rec_copy)

        scored.sort(key=lambda x: x["composite_score"], reverse=True)
        logger.info("Scoring complete. Top score: %.2f", scored[0]["composite_score"] if scored else 0)
        return scored
