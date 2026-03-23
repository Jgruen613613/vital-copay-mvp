"""Tests for the discovery module."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.discovery.aggregator import tag_domains, Aggregator
from src.discovery.uspto_fetcher import USPTOFetcher


# Fixture: saved USPTO API response
SAMPLE_PATENT = {
    "patent_number": "11111111",
    "patent_title": "Machine Learning System for Drug Discovery",
    "patent_abstract": "A neural network-based system for predicting drug-protein interactions.",
    "patent_date": "2024-06-15",
    "patent_num_cited_by_us_patents": 5,
    "patent_num_claims": 20,
    "inventors": [
        {"inventor_first_name": "Jane", "inventor_last_name": "Doe"},
        {"inventor_first_name": "John", "inventor_last_name": "Smith"},
    ],
    "cpcs": [
        {"cpc_group_id": "G06N3/08", "cpc_subgroup_id": None},
        {"cpc_group_id": "A61K31/00", "cpc_subgroup_id": None},
    ],
    "assignees": [
        {"assignee_organization": "Massachusetts Institute of Technology"}
    ],
}


def test_normalize_patent():
    """Test USPTO patent normalization."""
    result = USPTOFetcher._normalize(SAMPLE_PATENT, "MIT")
    assert result["id"] == "USPTO-11111111"
    assert result["source"] == "uspto"
    assert "Drug Discovery" in result["title"]
    assert len(result["authors"]) == 2
    assert result["authors"][0] == "Jane Doe"
    assert len(result["raw_metadata"]["cpc_codes"]) == 2


def test_tag_domains():
    """Test domain tagging from text."""
    text = "A neural network approach for protein folding prediction"
    tags = tag_domains(text)
    assert "protein_engineering" in tags or "ai_ml" in tags

    text2 = "Novel solar cell design using perovskite materials"
    tags2 = tag_domains(text2)
    assert "climate_energy" in tags2

    text3 = "Random unrelated topic about cooking recipes"
    tags3 = tag_domains(text3)
    assert tags3 == ["general"]


def test_deduplicate():
    """Test deduplication logic."""
    records = [
        {"id": "1", "title": "Machine Learning for Drug Discovery"},
        {"id": "2", "title": "Machine Learning for Drug Discovery Methods"},  # near-dup
        {"id": "3", "title": "Quantum Computing Error Correction"},
    ]
    deduped = Aggregator._deduplicate(records, threshold=85)
    assert len(deduped) == 2  # The near-duplicate should be removed
    assert deduped[0]["id"] == "1"
    assert deduped[1]["id"] == "3"


if __name__ == "__main__":
    test_normalize_patent()
    test_tag_domains()
    test_deduplicate()
    print("All discovery tests passed!")
