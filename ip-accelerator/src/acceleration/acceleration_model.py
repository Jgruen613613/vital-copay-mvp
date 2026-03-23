"""AI-Science acceleration model — estimates AI timeline compression for IP."""

import logging
from pathlib import Path
from typing import Any

import yaml

from src.acceleration.domain_classifier import (
    classify_domain,
    compute_relevance_score,
)

logger = logging.getLogger(__name__)

DOMAIN_CONFIGS_PATH = Path(__file__).parent / "domain_configs.yaml"


def load_domain_configs() -> dict[str, dict]:
    """Load domain acceleration parameters from YAML.

    Returns:
        Dict mapping domain name to config dict.
    """
    with open(DOMAIN_CONFIGS_PATH, "r") as f:
        return yaml.safe_load(f)


class AccelerationModel:
    """Applies AI-science acceleration multipliers to scored IP records."""

    def __init__(self, domain_configs: dict[str, dict] | None = None):
        """Initialize with domain configurations.

        Args:
            domain_configs: Domain name → parameters dict. Loaded from YAML if None.
        """
        self.configs = domain_configs or load_domain_configs()

    def apply_acceleration(self, records: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Apply acceleration multipliers to all scored records.

        Args:
            records: List of scored IP records (must have composite_score).

        Returns:
            Records augmented with acceleration_multiplier, adjusted_composite_score,
            acceleration_domain, and acceleration_rationale.
        """
        logger.info("Applying AI acceleration model to %d records...", len(records))

        results = []
        for rec in records:
            domain = classify_domain(rec)
            config = self.configs.get(domain, self.configs.get("general", {}))

            compression = config.get("ai_compression_factor", 2.0)
            maturity = config.get("current_ai_maturity", 0.3)
            trend = config.get("acceleration_trend", 1.0)
            examples = config.get("example_breakthroughs", [])

            relevance = compute_relevance_score(rec, domain)

            # Value multiplier formula
            multiplier = 1.0 + (compression * maturity * trend - 1.0) * relevance

            composite = rec.get("composite_score", 5.0)
            adjusted = round(composite * multiplier, 2)

            rationale = (
                f"Domain: {domain.replace('_', ' ').title()}. "
                f"AI compression factor: {compression}x. "
                f"Current AI maturity: {maturity:.0%}. "
                f"Acceleration trend: {trend}x. "
                f"IP relevance to AI-acceleratable R&D: {relevance:.0%}. "
                f"Multiplier: {multiplier:.2f}x."
            )
            if examples:
                rationale += f" Precedents: {examples[0]}."

            rec_copy = dict(rec)
            rec_copy["acceleration_domain"] = domain
            rec_copy["acceleration_multiplier"] = round(multiplier, 3)
            rec_copy["adjusted_composite_score"] = adjusted
            rec_copy["acceleration_rationale"] = rationale
            rec_copy["relevance_score"] = relevance
            results.append(rec_copy)

        results.sort(key=lambda x: x["adjusted_composite_score"], reverse=True)
        logger.info("Acceleration complete. Top adjusted score: %.2f",
                     results[0]["adjusted_composite_score"] if results else 0)
        return results
