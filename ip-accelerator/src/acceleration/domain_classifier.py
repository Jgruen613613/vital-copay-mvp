"""Classify IP records into AI-impact domains."""

from typing import Any

# 15 AI-impact domains with keyword patterns
DOMAIN_PATTERNS: dict[str, list[str]] = {
    "drug_discovery": [
        "drug", "pharma", "therapeutic", "clinical trial", "dosage",
        "pharmacol", "medicinal chemistry", "small molecule", "drug target",
        "inhibitor", "agonist", "antagonist",
    ],
    "materials_science": [
        "material", "alloy", "polymer", "composite", "ceramic",
        "coating", "nanostructure", "thin film", "crystal", "metallurg",
    ],
    "protein_engineering": [
        "protein", "enzyme", "antibody", "peptide", "biologic",
        "folding", "amino acid", "recombinant", "monoclonal",
    ],
    "semiconductor": [
        "semiconductor", "transistor", "chip", "wafer", "lithograph",
        "cmos", "integrated circuit", "vlsi", "mosfet", "photonic",
    ],
    "climate_energy": [
        "solar", "battery", "wind energy", "carbon capture", "catalyst",
        "renewable", "fuel cell", "photovoltaic", "energy storage",
        "electrolysis", "green hydrogen",
    ],
    "autonomous_systems": [
        "robot", "autonomous", "drone", "self-driving", "navigation",
        "lidar", "slam", "motion planning", "manipulator",
    ],
    "medical_diagnostics": [
        "diagnostic", "imaging", "biomarker", "mri", "ct scan",
        "ultrasound", "point-of-care", "assay", "screening",
    ],
    "agriculture": [
        "crop", "soil", "pesticide", "fertilizer", "agriculture",
        "plant breeding", "irrigation", "livestock", "agronomy",
    ],
    "quantum_computing": [
        "quantum", "qubit", "entanglement", "superposition",
        "quantum error", "quantum gate", "quantum circuit",
    ],
    "synthetic_biology": [
        "synthetic biology", "gene edit", "crispr", "genome",
        "metabolic engineer", "gene expression", "plasmid", "gene therapy",
    ],
    "telecom": [
        "5g", "antenna", "wireless", "telecom", "signal processing",
        "mimo", "beamforming", "spectrum", "modulation",
    ],
    "aerospace": [
        "aerospace", "satellite", "propulsion", "orbit", "spacecraft",
        "aerodynamic", "hypersonic", "turbine", "avionics",
    ],
    "financial": [
        "financial model", "portfolio", "risk model", "algorithmic trading",
        "fintech", "credit", "derivatives", "actuarial",
    ],
    "cybersecurity": [
        "cybersecurity", "encryption", "malware", "intrusion",
        "authentication", "firewall", "vulnerability", "cryptograph",
    ],
    "ai_ml": [
        "machine learning", "neural network", "deep learning",
        "artificial intelligence", "nlp", "computer vision",
        "reinforcement learning", "transformer", "generative model",
    ],
}


def classify_domain(record: dict[str, Any]) -> str:
    """Classify an IP record into its primary AI-impact domain.

    Args:
        record: IP record with title and abstract.

    Returns:
        Primary domain string.
    """
    text = f"{record.get('title', '')} {record.get('abstract', '')}".lower()

    scores: dict[str, int] = {}
    for domain, keywords in DOMAIN_PATTERNS.items():
        count = sum(1 for kw in keywords if kw in text)
        if count > 0:
            scores[domain] = count

    if not scores:
        return "general"

    return max(scores, key=scores.get)


def classify_all_domains(record: dict[str, Any]) -> list[str]:
    """Return all matching domains for a record, ranked by relevance.

    Args:
        record: IP record.

    Returns:
        List of domain strings, most relevant first.
    """
    text = f"{record.get('title', '')} {record.get('abstract', '')}".lower()

    scores: dict[str, int] = {}
    for domain, keywords in DOMAIN_PATTERNS.items():
        count = sum(1 for kw in keywords if kw in text)
        if count > 0:
            scores[domain] = count

    if not scores:
        return ["general"]

    return sorted(scores, key=scores.get, reverse=True)


def compute_relevance_score(record: dict[str, Any], domain: str) -> float:
    """Compute how central the IP is to the AI-acceleratable portion of a domain.

    Args:
        record: IP record.
        domain: Target domain.

    Returns:
        Relevance score 0.0-1.0.
    """
    text = f"{record.get('title', '')} {record.get('abstract', '')}".lower()
    keywords = DOMAIN_PATTERNS.get(domain, [])
    if not keywords:
        return 0.1

    matches = sum(1 for kw in keywords if kw in text)
    # Normalize by keyword list length
    relevance = min(1.0, matches / max(1, len(keywords) * 0.3))

    # Boost if AI/ML keywords also present (more AI-acceleratable)
    ai_keywords = ["machine learning", "neural", "deep learning", "ai", "model", "algorithm"]
    ai_matches = sum(1 for kw in ai_keywords if kw in text)
    if ai_matches > 0:
        relevance = min(1.0, relevance + 0.15)

    return round(relevance, 3)
