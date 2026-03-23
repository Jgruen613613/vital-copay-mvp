"""Pipeline orchestrator — runs discovery, scoring, acceleration, and matching."""

import json
import logging
import csv
from pathlib import Path
from typing import Any

import yaml

from src.discovery.aggregator import Aggregator
from src.scoring.composite import CompositeScorer
from src.acceleration.acceleration_model import AccelerationModel
from src.matching.matcher import IPMatcher
from src.utils.cache import FileCache
from src.utils.rate_limiter import RateLimiter

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_PATH = BASE_DIR / "config" / "settings.yaml"
OUTPUT_DIR = BASE_DIR / "data" / "outputs"
PROCESSED_DIR = BASE_DIR / "data" / "processed"


def load_config() -> dict:
    """Load pipeline configuration from settings.yaml."""
    with open(CONFIG_PATH, "r") as f:
        return yaml.safe_load(f)


class Pipeline:
    """Orchestrates the full IP accelerator pipeline."""

    def __init__(self, config: dict | None = None):
        """Initialize pipeline with configuration.

        Args:
            config: Configuration dict. Loaded from settings.yaml if None.
        """
        self.config = config or load_config()
        self.cache = FileCache(
            ttl_hours=self.config.get("pipeline", {}).get("cache_ttl_hours", 24)
        )
        self.rate_limiter = RateLimiter(
            calls_per_second=self.config.get("pipeline", {}).get("rate_limit_per_second", 0.33)
        )

        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    def run(self, stages: list[str] | None = None) -> list[dict[str, Any]]:
        """Run the full pipeline or specific stages.

        Args:
            stages: List of stage names to run. None = all stages.
                    Options: 'discovery', 'scoring', 'acceleration', 'matching'

        Returns:
            Final list of processed IP records.
        """
        if stages is None:
            stages = ["discovery", "scoring", "acceleration", "matching"]

        records: list[dict[str, Any]] = []

        if "discovery" in stages:
            records = self._run_discovery()
            self._save_intermediate(records, "discovery")
        else:
            records = self._load_intermediate("discovery")

        if "scoring" in stages:
            records = self._run_scoring(records)
            self._save_intermediate(records, "scored")
        elif "acceleration" in stages or "matching" in stages:
            records = self._load_intermediate("scored") or records

        if "acceleration" in stages:
            records = self._run_acceleration(records)
            self._save_intermediate(records, "accelerated")
        elif "matching" in stages:
            records = self._load_intermediate("accelerated") or records

        if "matching" in stages:
            records = self._run_matching(records)

        # Save final output
        self._save_final(records)
        return records

    def _run_discovery(self) -> list[dict[str, Any]]:
        """Run the discovery stage."""
        logger.info("=" * 60)
        logger.info("STAGE 1: DISCOVERY")
        logger.info("=" * 60)

        universities = self.config.get("target_universities", [])
        disc_config = self.config.get("discovery", {})

        aggregator = Aggregator(
            universities=universities,
            cache=self.cache,
            rate_limiter=self.rate_limiter,
            max_patents=disc_config.get("max_patents_per_university", 200),
            arxiv_max=disc_config.get("arxiv_max_results", 100),
            date_range_years=disc_config.get("date_range_years", 2),
        )

        records = aggregator.discover_all()
        logger.info("Discovery complete: %d records", len(records))
        return records

    def _run_scoring(self, records: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Run the scoring stage."""
        logger.info("=" * 60)
        logger.info("STAGE 2: SCORING")
        logger.info("=" * 60)

        weights = self.config.get("scoring_weights", None)
        scorer = CompositeScorer(weights=weights)
        scored = scorer.score_all(records)
        logger.info("Scoring complete: %d records scored", len(scored))
        return scored

    def _run_acceleration(self, records: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Run the acceleration stage."""
        logger.info("=" * 60)
        logger.info("STAGE 3: ACCELERATION")
        logger.info("=" * 60)

        model = AccelerationModel()
        accelerated = model.apply_acceleration(records)
        logger.info("Acceleration complete: %d records processed", len(accelerated))
        return accelerated

    def _run_matching(self, records: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Run the matching stage."""
        logger.info("=" * 60)
        logger.info("STAGE 4: MATCHING")
        logger.info("=" * 60)

        matcher = IPMatcher()
        matched = matcher.match_all(records)
        logger.info("Matching complete: %d records matched", len(matched))
        return matched

    def _save_intermediate(self, records: list[dict[str, Any]], stage: str):
        """Save intermediate results to processed directory."""
        path = PROCESSED_DIR / f"{stage}.json"
        with open(path, "w") as f:
            json.dump(records, f, indent=2, default=str)
        logger.info("Saved %d records to %s", len(records), path)

    def _load_intermediate(self, stage: str) -> list[dict[str, Any]]:
        """Load intermediate results from processed directory."""
        path = PROCESSED_DIR / f"{stage}.json"
        if path.exists():
            with open(path, "r") as f:
                records = json.load(f)
            logger.info("Loaded %d records from %s", len(records), path)
            return records
        return []

    def _save_final(self, records: list[dict[str, Any]]):
        """Save final results as JSON and CSV."""
        # JSON output
        json_path = OUTPUT_DIR / "pipeline_results.json"
        with open(json_path, "w") as f:
            json.dump(records, f, indent=2, default=str)

        # CSV summary
        csv_path = OUTPUT_DIR / "pipeline_results.csv"
        if records:
            fieldnames = [
                "id", "source", "title", "institution", "date",
                "composite_score", "acceleration_domain",
                "acceleration_multiplier", "adjusted_composite_score",
                "confidence_level", "top_match_company", "top_match_score",
            ]
            with open(csv_path, "w", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                for rec in records:
                    top_match = rec.get("corporate_matches", [{}])[0] if rec.get("corporate_matches") else {}
                    writer.writerow({
                        "id": rec.get("id", ""),
                        "source": rec.get("source", ""),
                        "title": rec.get("title", "")[:100],
                        "institution": rec.get("institution", ""),
                        "date": rec.get("date", ""),
                        "composite_score": rec.get("composite_score", ""),
                        "acceleration_domain": rec.get("acceleration_domain", ""),
                        "acceleration_multiplier": rec.get("acceleration_multiplier", ""),
                        "adjusted_composite_score": rec.get("adjusted_composite_score", ""),
                        "confidence_level": rec.get("confidence_level", ""),
                        "top_match_company": top_match.get("company", ""),
                        "top_match_score": top_match.get("match_score", ""),
                    })

        logger.info("Final results saved: %s, %s", json_path, csv_path)
        logger.info("Total records: %d", len(records))
        if records:
            top = records[0]
            logger.info(
                "Top IP: %s (score: %.2f, adjusted: %.2f)",
                top.get("title", "")[:60],
                top.get("composite_score", 0),
                top.get("adjusted_composite_score", 0),
            )
