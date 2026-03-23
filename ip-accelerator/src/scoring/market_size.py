"""Market size scoring based on addressable market mapping."""

from typing import Any

# TAM estimates in billions USD for technology markets
MARKET_SIZE_TABLE: dict[str, float] = {
    # Pharma / Life Sciences
    "drug_discovery": 1500.0,
    "protein_engineering": 400.0,
    "medical_diagnostics": 320.0,
    "synthetic_biology": 60.0,
    "agriculture": 450.0,
    # Tech / Computing
    "ai_ml": 900.0,
    "semiconductor": 600.0,
    "quantum_computing": 15.0,
    "cybersecurity": 250.0,
    "autonomous_systems": 200.0,
    "telecom": 700.0,
    # Energy / Materials
    "climate_energy": 500.0,
    "materials_science": 350.0,
    # Other
    "aerospace": 400.0,
    "financial": 300.0,
    "general": 50.0,
}

# CPC code prefix to market mapping
CPC_MARKET_MAP: dict[str, str] = {
    "A61": "drug_discovery",       # Medical / Veterinary
    "C07": "drug_discovery",       # Organic chemistry
    "C12": "protein_engineering",  # Biochemistry
    "G01N": "medical_diagnostics", # Investigating materials
    "G06N": "ai_ml",              # Computing arrangements
    "G06F": "ai_ml",              # Electric digital data processing
    "H01L": "semiconductor",      # Semiconductor devices
    "H04": "telecom",             # Electric communication
    "B64": "aerospace",           # Aircraft
    "H02": "climate_energy",      # Generation/conversion of electric power
    "G16B": "protein_engineering", # Bioinformatics
    "B25J": "autonomous_systems", # Manipulators / robots
    "G06Q": "financial",          # Data processing for business
}


def score_market_size(record: dict[str, Any]) -> float:
    """Score market size based on domain tags and CPC codes.

    Args:
        record: IP record with domain_tags and raw_metadata.

    Returns:
        Market size score (1-10).
    """
    domains = set(record.get("domain_tags", []))

    # Also map from CPC codes
    for code in record.get("raw_metadata", {}).get("cpc_codes", []):
        for prefix, market in CPC_MARKET_MAP.items():
            if code.startswith(prefix):
                domains.add(market)

    if not domains:
        domains = {"general"}

    # Aggregate TAM from all matched domains
    total_tam = sum(MARKET_SIZE_TABLE.get(d, 50.0) for d in domains)

    # Scale to 1-10 using logarithmic mapping
    # $15B (quantum) → ~3, $500B+ → 8+, $1T+ → 10
    import math
    if total_tam <= 0:
        return 1.0

    score = 1.0 + 2.5 * math.log10(total_tam / 10.0)
    return round(min(10.0, max(1.0, score)), 2)
