"""Tests for the matching and acceleration modules."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.acceleration.domain_classifier import classify_domain, compute_relevance_score
from src.acceleration.acceleration_model import AccelerationModel
from src.matching.matcher import IPMatcher
from src.scoring.composite import CompositeScorer


SAMPLE_RECORDS = [
    {
        "id": "TEST-1",
        "source": "uspto",
        "title": "Deep Learning System for Protein Structure Prediction",
        "abstract": "A neural network for predicting protein folding using attention mechanisms and amino acid embeddings.",
        "domain_tags": ["protein_engineering", "ai_ml"],
        "date": "2024-03-15",
        "authors": ["Test Author"],
        "raw_metadata": {
            "num_claims": 20,
            "forward_citations": 10,
            "cpc_codes": ["G16B15/30", "G06N3/08", "C12N15/10"],
            "assignees": ["Test University"],
        },
    },
    {
        "id": "TEST-2",
        "source": "arxiv",
        "title": "Autonomous Drone Navigation in Urban Environments",
        "abstract": "A reinforcement learning approach for autonomous drone navigation using computer vision and lidar sensor fusion.",
        "domain_tags": ["autonomous_systems", "ai_ml"],
        "date": "2024-06-01",
        "authors": ["Another Author"],
        "raw_metadata": {},
    },
]


def test_domain_classification():
    """Domain classifier should identify correct domains."""
    domain1 = classify_domain(SAMPLE_RECORDS[0])
    assert domain1 == "protein_engineering"

    domain2 = classify_domain(SAMPLE_RECORDS[1])
    assert domain2 == "autonomous_systems"


def test_relevance_score_in_range():
    """Relevance scores should be between 0 and 1."""
    for rec in SAMPLE_RECORDS:
        domain = classify_domain(rec)
        score = compute_relevance_score(rec, domain)
        assert 0.0 <= score <= 1.0, f"Relevance {score} out of range"


def test_acceleration_multiplier():
    """Acceleration should produce multiplier >= 1.0."""
    scorer = CompositeScorer()
    scored = scorer.score_all(SAMPLE_RECORDS)

    model = AccelerationModel()
    accelerated = model.apply_acceleration(scored)

    for rec in accelerated:
        assert rec["acceleration_multiplier"] >= 1.0
        assert rec["adjusted_composite_score"] >= rec["composite_score"]
        assert rec["acceleration_domain"] != ""
        assert rec["acceleration_rationale"] != ""


def test_matching_returns_ranked_results():
    """Matcher should return ranked corporate matches for each record."""
    scorer = CompositeScorer()
    scored = scorer.score_all(SAMPLE_RECORDS)

    model = AccelerationModel()
    accelerated = model.apply_acceleration(scored)

    matcher = IPMatcher()
    matched = matcher.match_all(accelerated)

    for rec in matched:
        assert "corporate_matches" in rec
        matches = rec["corporate_matches"]
        assert len(matches) == 5  # Top 5
        # Should be sorted descending
        scores = [m["match_score"] for m in matches]
        assert scores == sorted(scores, reverse=True)
        # Each match should have required fields
        for m in matches:
            assert "company" in m
            assert "match_score" in m
            assert "rationale" in m


def test_integration_pipeline():
    """Integration test: run full pipeline on sample records."""
    scorer = CompositeScorer()
    scored = scorer.score_all(SAMPLE_RECORDS)
    assert len(scored) == 2

    model = AccelerationModel()
    accelerated = model.apply_acceleration(scored)
    assert len(accelerated) == 2

    matcher = IPMatcher()
    matched = matcher.match_all(accelerated)
    assert len(matched) == 2

    # Verify complete record structure
    for rec in matched:
        assert "id" in rec
        assert "composite_score" in rec
        assert "dimension_scores" in rec
        assert "acceleration_multiplier" in rec
        assert "adjusted_composite_score" in rec
        assert "corporate_matches" in rec
        assert len(rec["corporate_matches"]) == 5


if __name__ == "__main__":
    test_domain_classification()
    test_relevance_score_in_range()
    test_acceleration_multiplier()
    test_matching_returns_ranked_results()
    test_integration_pipeline()
    print("All matching tests passed!")
