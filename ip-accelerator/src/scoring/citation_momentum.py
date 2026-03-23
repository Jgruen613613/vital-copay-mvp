"""Citation momentum scoring."""

from datetime import datetime
from typing import Any


def score_citation_momentum(record: dict[str, Any]) -> float:
    """Score citation momentum for a patent based on forward citations.

    For non-patent records, returns a neutral score.

    Args:
        record: IP record.

    Returns:
        Citation momentum score (1-10).
    """
    if record.get("source") != "uspto":
        return 5.0  # Neutral for non-patent sources

    meta = record.get("raw_metadata", {})
    citations = meta.get("forward_citations")
    if citations is None:
        citations = 0
    citations = int(citations)

    # Calculate citation velocity (citations per year)
    patent_date = record.get("date", "")
    if patent_date:
        try:
            grant_date = datetime.strptime(patent_date, "%Y-%m-%d")
            years_since = max(0.5, (datetime.now() - grant_date).days / 365.25)
            velocity = citations / years_since
        except (ValueError, ZeroDivisionError):
            velocity = citations
    else:
        velocity = citations

    # Score mapping:
    # 0 citations → 2
    # 1-3 citations/year → 4-6
    # 5+ citations/year → 7-8
    # 10+ citations/year → 9-10
    if velocity <= 0:
        score = 2.0
    elif velocity < 1:
        score = 2.0 + 2.0 * velocity
    elif velocity < 5:
        score = 4.0 + (velocity - 1) * 0.75
    elif velocity < 10:
        score = 7.0 + (velocity - 5) * 0.4
    else:
        score = 9.0 + min(1.0, (velocity - 10) * 0.1)

    return round(min(10.0, max(1.0, score)), 2)
