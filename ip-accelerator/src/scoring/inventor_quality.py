"""Inventor quality scoring based on patent portfolio analysis."""

from typing import Any


def score_inventor_quality(
    record: dict[str, Any],
    inventor_stats: dict[str, dict] | None = None,
) -> float:
    """Score inventor quality based on prolificacy and impact.

    Args:
        record: IP record with authors list.
        inventor_stats: Pre-computed stats per inventor name:
            {name: {"total_patents": int, "high_impact": int}}

    Returns:
        Inventor quality score (1-10).
    """
    if not inventor_stats:
        # Without pre-computed stats, use heuristics
        authors = record.get("authors", [])
        if not authors:
            return 3.0
        # More co-authors on a patent can indicate institutional strength
        author_count = len(authors)
        if author_count >= 5:
            return 6.0
        elif author_count >= 3:
            return 5.0
        else:
            return 4.0

    authors = record.get("authors", [])
    if not authors:
        return 3.0

    # Use the best inventor's stats
    best_score = 3.0
    for author in authors:
        stats = inventor_stats.get(author, {})
        total = stats.get("total_patents", 0)
        high_impact = stats.get("high_impact", 0)

        # Scoring: prolific inventors with high-impact patents score higher
        if total >= 50 and high_impact >= 10:
            score = 9.0
        elif total >= 20 and high_impact >= 5:
            score = 7.5
        elif total >= 10:
            score = 6.0
        elif total >= 5:
            score = 5.0
        elif total >= 1:
            score = 4.0
        else:
            score = 3.0

        best_score = max(best_score, score)

    return round(min(10.0, max(1.0, best_score)), 2)


def build_inventor_stats(records: list[dict[str, Any]]) -> dict[str, dict]:
    """Build inventor statistics from a corpus of patent records.

    Args:
        records: List of IP records (patents).

    Returns:
        Dict mapping inventor name to stats.
    """
    stats: dict[str, dict] = {}

    for r in records:
        if r.get("source") != "uspto":
            continue
        citations = r.get("raw_metadata", {}).get("forward_citations", 0) or 0
        for author in r.get("authors", []):
            if author not in stats:
                stats[author] = {"total_patents": 0, "high_impact": 0}
            stats[author]["total_patents"] += 1
            if int(citations) >= 10:
                stats[author]["high_impact"] += 1

    return stats
