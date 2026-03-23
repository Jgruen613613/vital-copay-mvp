"""IP-to-corporate matchmaking engine."""

import logging
from typing import Any

from src.matching.company_profiler import get_all_profiles

logger = logging.getLogger(__name__)


class IPMatcher:
    """Matches scored IP records to corporate buyers."""

    def __init__(self, company_profiles: list[dict] | None = None):
        """Initialize with company profiles.

        Args:
            company_profiles: List of company profile dicts.
        """
        self.profiles = company_profiles or get_all_profiles()

    def match_all(self, records: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Match all IP records to corporate buyers.

        Args:
            records: Scored and acceleration-augmented IP records.

        Returns:
            Records augmented with corporate_matches field (top 5 per record).
        """
        logger.info("Matching %d IP records to %d companies...",
                     len(records), len(self.profiles))

        results = []
        for rec in records:
            matches = []
            for company in self.profiles:
                score, rationale = self._compute_match(rec, company)
                matches.append({
                    "company": company["name"],
                    "match_score": round(score, 2),
                    "rationale": rationale,
                    "r_and_d_budget_billions": company.get("r_and_d_budget_billions", 0),
                })

            # Sort by match score, take top 5
            matches.sort(key=lambda m: m["match_score"], reverse=True)
            top_matches = matches[:5]

            rec_copy = dict(rec)
            rec_copy["corporate_matches"] = top_matches
            results.append(rec_copy)

        logger.info("Matching complete.")
        return results

    def _compute_match(self, record: dict[str, Any], company: dict) -> tuple[float, str]:
        """Compute match score between an IP record and a company.

        Args:
            record: Scored IP record.
            company: Company profile.

        Returns:
            Tuple of (match_score 0-100, rationale string).
        """
        reasons = []

        # 1. Technology alignment (keyword overlap)
        ip_text = f"{record.get('title', '')} {record.get('abstract', '')}".lower()
        domain_tags = record.get("domain_tags", [])
        tech_interests = company.get("technology_interests", [])

        keyword_hits = sum(1 for kw in tech_interests if kw.lower() in ip_text)
        domain_hits = sum(
            1 for tag in domain_tags
            if any(tag.lower() in interest.lower() for interest in tech_interests)
        )
        tech_score = min(30.0, (keyword_hits * 5.0 + domain_hits * 3.0))
        if tech_score > 10:
            reasons.append(f"Strong technology alignment ({keyword_hits} keyword matches)")

        # 2. Whitespace fit (IP CPC codes in company's patent gaps)
        cpc_codes = record.get("raw_metadata", {}).get("cpc_codes", [])
        whitespace = company.get("patent_whitespace", [])
        whitespace_hits = sum(
            1 for code in cpc_codes
            if any(code.startswith(ws) for ws in whitespace)
        )
        whitespace_score = min(25.0, whitespace_hits * 8.0)
        if whitespace_hits > 0:
            reasons.append(f"Fills patent whitespace ({whitespace_hits} CPC overlaps)")

        # 3. Market relevance (domain matches industry focus)
        accel_domain = record.get("acceleration_domain", "general")
        industry_focus = company.get("industry_focus", [])
        market_hit = any(
            accel_domain.replace("_", " ") in ind or ind in accel_domain.replace("_", " ")
            for ind in industry_focus
        )
        # Check broader domain tag overlap
        domain_industry_hits = sum(
            1 for tag in domain_tags
            if any(tag.replace("_", " ") in ind or ind in tag.replace("_", " ")
                   for ind in industry_focus)
        )
        market_score = 20.0 if market_hit else min(15.0, domain_industry_hits * 5.0)
        if market_hit:
            reasons.append(f"Direct market relevance ({accel_domain.replace('_', ' ')})")

        # 4. Strategic value (TRL * acceleration multiplier)
        trl = record.get("dimension_scores", {}).get("trl", 5.0)
        multiplier = record.get("acceleration_multiplier", 1.0)
        strategic = (trl / 10.0) * multiplier * 25.0
        strategic_score = min(25.0, strategic)
        if strategic > 15:
            reasons.append(f"High strategic value (TRL {trl:.0f}, {multiplier:.1f}x acceleration)")

        total = tech_score + whitespace_score + market_score + strategic_score
        rationale = "; ".join(reasons) if reasons else "Low match — minimal technology overlap"

        return total, rationale
