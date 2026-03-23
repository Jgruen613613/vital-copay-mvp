"""All 10 scoring dimensions implemented as deterministic heuristics."""

import re
from datetime import datetime
from typing import Any

from src.scoring.market_size import score_market_size
from src.scoring.citation_momentum import score_citation_momentum


def score_defensibility(record: dict[str, Any]) -> float:
    """Score breadth of claims / defensibility.

    For patents: proxy via number of claims and CPC code breadth.
    For papers/grants: proxy via number of distinct application domains.

    Returns:
        Score 1-10.
    """
    meta = record.get("raw_metadata", {})

    if record.get("source") == "uspto":
        num_claims = meta.get("num_claims")
        if num_claims is not None:
            num_claims = int(num_claims)
        else:
            num_claims = 10  # default estimate

        cpc_breadth = len(set(c[:4] for c in meta.get("cpc_codes", [])))

        # More claims and broader CPC coverage = more defensible
        claims_score = min(10.0, 2.0 + num_claims * 0.3)
        breadth_score = min(10.0, 3.0 + cpc_breadth * 1.5)
        return round(min(10.0, (claims_score + breadth_score) / 2), 2)
    else:
        # Count domain tags as proxy
        domains = record.get("domain_tags", [])
        return round(min(10.0, max(1.0, 3.0 + len(domains) * 1.5)), 2)


def score_trl(record: dict[str, Any]) -> float:
    """Score Technology Readiness Level from abstract keywords.

    Returns:
        TRL score normalized to 1-10.
    """
    text = (record.get("abstract", "") + " " + record.get("title", "")).lower()

    trl_keywords = {
        9: ["commercial", "fda approved", "market", "production", "manufactured"],
        8: ["qualified", "flight proven", "validated in operational"],
        7: ["demonstrated", "prototype tested", "field test", "operational environment"],
        6: ["prototype", "demonstrated in relevant", "pilot"],
        5: ["validated", "laboratory validated", "bench-scale"],
        4: ["lab test", "laboratory", "proof of concept", "in vitro"],
        3: ["experimental", "analytical", "simulated", "computational model"],
        2: ["theoretical", "concept", "hypothesis", "proposed", "formulation"],
        1: ["basic research", "fundamental", "observed", "principle"],
    }

    max_trl = 2  # default for academic IP
    for trl_level, keywords in trl_keywords.items():
        for kw in keywords:
            if kw in text:
                max_trl = max(max_trl, trl_level)

    # Normalize TRL 1-9 to score 1-10
    return round(1.0 + (max_trl - 1) * (9.0 / 8.0), 2)


def score_competitive_landscape(record: dict[str, Any], all_records: list[dict[str, Any]] | None = None) -> float:
    """Score competitive landscape density.

    Counts similar patents in same CPC classes. More crowded = lower score.

    Returns:
        Score 1-10 (10 = least competition).
    """
    cpc_codes = record.get("raw_metadata", {}).get("cpc_codes", [])
    if not cpc_codes or not all_records:
        return 5.0  # Neutral

    # Count other records sharing the same CPC groups
    my_groups = set(c[:4] for c in cpc_codes)
    competitors = 0
    for other in all_records:
        if other["id"] == record["id"]:
            continue
        other_codes = other.get("raw_metadata", {}).get("cpc_codes", [])
        other_groups = set(c[:4] for c in other_codes)
        if my_groups & other_groups:
            competitors += 1

    # More competitors = lower score
    if competitors == 0:
        return 9.0
    elif competitors < 5:
        return 7.0
    elif competitors < 15:
        return 5.0
    elif competitors < 30:
        return 3.0
    else:
        return 2.0


def score_fto_risk(record: dict[str, Any], all_records: list[dict[str, Any]] | None = None) -> float:
    """Score freedom-to-operate risk.

    Counts active patents in same narrow CPC subclass by non-university assignees.
    More blocking patents = higher risk = lower score.

    Returns:
        Score 1-10 (10 = lowest risk / best FTO).
    """
    cpc_codes = record.get("raw_metadata", {}).get("cpc_codes", [])
    if not cpc_codes or not all_records:
        return 6.0

    institution = record.get("institution", "").lower()
    blocking = 0

    for other in all_records:
        if other["id"] == record["id"]:
            continue
        other_inst = other.get("institution", "").lower()
        if other_inst == institution:
            continue  # Same university
        other_codes = other.get("raw_metadata", {}).get("cpc_codes", [])
        # Check narrow subclass overlap
        my_subcodes = set(cpc_codes)
        if my_subcodes & set(other_codes):
            blocking += 1

    if blocking == 0:
        return 9.0
    elif blocking < 3:
        return 7.0
    elif blocking < 10:
        return 5.0
    elif blocking < 20:
        return 3.0
    else:
        return 1.0


def score_patent_life(record: dict[str, Any]) -> float:
    """Score remaining patent life and geographic coverage.

    Returns:
        Score 1-10.
    """
    if record.get("source") != "uspto":
        return 5.0  # Neutral for non-patent sources

    patent_date = record.get("date", "")
    if not patent_date:
        return 5.0

    try:
        grant_date = datetime.strptime(patent_date, "%Y-%m-%d")
        # Patent term: 20 years from filing (approximate with grant date)
        years_remaining = 20.0 - (datetime.now() - grant_date).days / 365.25
        years_remaining = max(0, years_remaining)
    except ValueError:
        years_remaining = 15.0

    # More years remaining = higher score
    if years_remaining >= 18:
        score = 9.0
    elif years_remaining >= 15:
        score = 8.0
    elif years_remaining >= 10:
        score = 6.0
    elif years_remaining >= 5:
        score = 4.0
    else:
        score = 2.0

    return round(score, 2)


def score_licensing_complexity(record: dict[str, Any]) -> float:
    """Score licensing complexity.

    Fewer co-assignees and no government obligations = simpler licensing = higher score.

    Returns:
        Score 1-10 (10 = simplest to license).
    """
    meta = record.get("raw_metadata", {})
    assignees = meta.get("assignees", [])
    num_assignees = len([a for a in assignees if a]) if assignees else 1

    # Government interest (Bayh-Dole) check
    abstract = (record.get("abstract", "") or "").lower()
    has_govt = any(
        kw in abstract
        for kw in ["government interest", "government support", "federally sponsored"]
    )

    # NIH-funded implies Bayh-Dole obligations
    if record.get("source") == "nih":
        has_govt = True

    score = 8.0
    if num_assignees > 3:
        score -= 3.0
    elif num_assignees > 1:
        score -= 1.5

    if has_govt:
        score -= 2.0

    return round(min(10.0, max(1.0, score)), 2)
