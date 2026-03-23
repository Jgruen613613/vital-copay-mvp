"""Tests for the scoring module."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.scoring.technical_novelty import score_technical_novelty
from src.scoring.market_size import score_market_size
from src.scoring.citation_momentum import score_citation_momentum
from src.scoring.dimensions import score_trl, score_defensibility, score_patent_life
from src.scoring.composite import CompositeScorer


SAMPLE_RECORDS = [
    {
        "id": "A",
        "source": "uspto",
        "title": "Novel protein folding algorithm",
        "abstract": "A new deep learning approach to predict protein structures using transformer models and attention mechanisms for amino acid sequence analysis.",
        "domain_tags": ["protein_engineering", "ai_ml"],
        "date": "2024-01-15",
        "authors": ["Alice", "Bob"],
        "raw_metadata": {
            "num_claims": 20,
            "forward_citations": 15,
            "cpc_codes": ["G16B15/30", "G06N3/08"],
            "assignees": ["MIT"],
        },
    },
    {
        "id": "B",
        "source": "arxiv",
        "title": "Quantum error correction codes",
        "abstract": "We present a new quantum error correction scheme for topological qubits that achieves fault tolerance with minimal qubit overhead and improved logical error rates.",
        "domain_tags": ["quantum_computing"],
        "date": "2024-06-01",
        "authors": ["Charlie"],
        "raw_metadata": {},
    },
    {
        "id": "C",
        "source": "uspto",
        "title": "Battery electrode manufacturing process",
        "abstract": "A manufacturing method for solid-state battery electrodes using atomic layer deposition of ceramic electrolyte materials with improved ionic conductivity.",
        "domain_tags": ["climate_energy", "materials_science"],
        "date": "2023-06-15",
        "authors": ["Dave", "Eve"],
        "raw_metadata": {
            "num_claims": 12,
            "forward_citations": 3,
            "cpc_codes": ["H01M10/052", "C23C16/00"],
            "assignees": ["Stanford"],
        },
    },
]


def test_technical_novelty_scores_in_range():
    """Novelty scores should be between 1 and 10."""
    scores = score_technical_novelty(SAMPLE_RECORDS)
    for rid, score in scores.items():
        assert 1.0 <= score <= 10.0, f"Score {score} out of range for {rid}"


def test_market_size_scores_in_range():
    """Market size scores should be between 1 and 10."""
    for rec in SAMPLE_RECORDS:
        score = score_market_size(rec)
        assert 1.0 <= score <= 10.0, f"Market score {score} out of range"


def test_citation_momentum_patent_vs_paper():
    """Patents should use citation data; papers should get neutral score."""
    patent_score = score_citation_momentum(SAMPLE_RECORDS[0])  # USPTO with citations
    paper_score = score_citation_momentum(SAMPLE_RECORDS[1])  # arXiv
    assert paper_score == 5.0  # Neutral for non-patents
    assert patent_score != 5.0  # Should vary for patents


def test_trl_scoring():
    """TRL keywords should affect scores."""
    theoretical = {"title": "Theoretical analysis", "abstract": "A theoretical framework for quantum gravity"}
    prototype = {"title": "Prototype device", "abstract": "We demonstrated a prototype in laboratory conditions"}
    assert score_trl(theoretical) < score_trl(prototype)


def test_composite_scorer():
    """Composite scorer should produce valid results."""
    scorer = CompositeScorer()
    scored = scorer.score_all(SAMPLE_RECORDS)
    assert len(scored) == len(SAMPLE_RECORDS)
    for rec in scored:
        assert "composite_score" in rec
        assert "dimension_scores" in rec
        assert "confidence_level" in rec
        assert 0 < rec["composite_score"] < 11


def test_scoring_deterministic():
    """Same input should always produce same output."""
    scorer = CompositeScorer()
    run1 = scorer.score_all(SAMPLE_RECORDS)
    run2 = scorer.score_all(SAMPLE_RECORDS)
    for r1, r2 in zip(run1, run2):
        assert r1["composite_score"] == r2["composite_score"]


if __name__ == "__main__":
    test_technical_novelty_scores_in_range()
    test_market_size_scores_in_range()
    test_citation_momentum_patent_vs_paper()
    test_trl_scoring()
    test_composite_scorer()
    test_scoring_deterministic()
    print("All scoring tests passed!")
