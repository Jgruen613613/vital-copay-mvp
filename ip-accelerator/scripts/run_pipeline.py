#!/usr/bin/env python3
"""CLI entry point for the IP Accelerator pipeline."""

import argparse
import logging
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.pipeline import Pipeline


def main():
    parser = argparse.ArgumentParser(
        description="AI-Powered University IP Accelerator Pipeline"
    )
    parser.add_argument(
        "--stages",
        nargs="+",
        choices=["discovery", "scoring", "acceleration", "matching"],
        default=None,
        help="Run specific stages (default: all)",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose logging",
    )
    parser.add_argument(
        "--seed",
        action="store_true",
        help="Use seed data instead of live API calls",
    )
    args = parser.parse_args()

    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%H:%M:%S",
    )

    if args.seed:
        logging.info("Loading seed data for demo mode...")
        from scripts.seed_data import generate_seed_data, save_seed_data
        records = generate_seed_data()
        save_seed_data(records)
        logging.info("Seed data generated. Running scoring → matching on seed data...")
        pipeline = Pipeline()
        # Load seed data as discovery output
        import json
        processed_dir = Path(__file__).resolve().parent.parent / "data" / "processed"
        with open(processed_dir / "discovery.json", "w") as f:
            json.dump(records, f, indent=2, default=str)
        results = pipeline.run(stages=["scoring", "acceleration", "matching"])
    else:
        pipeline = Pipeline()
        results = pipeline.run(stages=args.stages)

    print(f"\n{'=' * 60}")
    print(f"PIPELINE COMPLETE — {len(results)} IP records processed")
    print(f"{'=' * 60}")

    if results:
        print(f"\nTop 10 IP by Adjusted Composite Score:")
        print(f"{'Rank':<5} {'Score':<8} {'Adj.':<8} {'Domain':<20} {'Title':<50}")
        print("-" * 91)
        for i, rec in enumerate(results[:10], 1):
            print(
                f"{i:<5} "
                f"{rec.get('composite_score', 0):<8.2f} "
                f"{rec.get('adjusted_composite_score', 0):<8.2f} "
                f"{rec.get('acceleration_domain', 'N/A'):<20} "
                f"{rec.get('title', '')[:50]}"
            )

    print(f"\nResults saved to: data/outputs/pipeline_results.json")
    print(f"CSV summary: data/outputs/pipeline_results.csv")
    print(f"Launch dashboard: streamlit run dashboard/app.py")


if __name__ == "__main__":
    main()
