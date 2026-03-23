"""Corporate buyer profiles for IP matchmaking."""

COMPANY_PROFILES: list[dict] = [
    {
        "name": "Google",
        "industry_focus": ["technology", "ai", "cloud", "advertising"],
        "technology_interests": [
            "machine learning", "neural network", "computer vision", "nlp",
            "quantum computing", "autonomous systems", "robotics", "cloud infrastructure",
        ],
        "patent_whitespace": ["A61", "C12", "C07"],  # Healthcare / biotech
        "r_and_d_budget_billions": 39.5,
        "recent_acquisitions": ["DeepMind health division", "Mandiant", "Alter"],
    },
    {
        "name": "Microsoft",
        "industry_focus": ["technology", "cloud", "enterprise", "ai"],
        "technology_interests": [
            "cloud computing", "artificial intelligence", "cybersecurity",
            "quantum computing", "mixed reality", "developer tools",
        ],
        "patent_whitespace": ["A61", "C12", "H02"],
        "r_and_d_budget_billions": 27.2,
        "recent_acquisitions": ["Activision Blizzard", "Nuance Communications"],
    },
    {
        "name": "Apple",
        "industry_focus": ["consumer electronics", "semiconductor", "services"],
        "technology_interests": [
            "semiconductor", "display technology", "sensor", "augmented reality",
            "health monitoring", "privacy", "chip design",
        ],
        "patent_whitespace": ["C07", "C12", "B64"],
        "r_and_d_budget_billions": 29.9,
        "recent_acquisitions": ["Primephonic", "AI Music"],
    },
    {
        "name": "Amazon",
        "industry_focus": ["ecommerce", "cloud", "logistics", "ai"],
        "technology_interests": [
            "robotics", "autonomous systems", "machine learning", "logistics",
            "voice recognition", "drone delivery", "satellite",
        ],
        "patent_whitespace": ["A61", "C07", "H01L"],
        "r_and_d_budget_billions": 73.2,
        "recent_acquisitions": ["iRobot", "One Medical"],
    },
    {
        "name": "Meta",
        "industry_focus": ["social media", "vr/ar", "ai"],
        "technology_interests": [
            "virtual reality", "augmented reality", "computer vision", "nlp",
            "social graph", "recommendation systems", "generative ai",
        ],
        "patent_whitespace": ["A61", "C07", "H02", "B64"],
        "r_and_d_budget_billions": 35.3,
        "recent_acquisitions": ["Within", "Luxexcel"],
    },
    {
        "name": "Nvidia",
        "industry_focus": ["semiconductor", "ai", "gaming"],
        "technology_interests": [
            "gpu", "ai training", "autonomous driving", "semiconductor",
            "computer graphics", "simulation", "robotics", "drug discovery ai",
        ],
        "patent_whitespace": ["A61", "C12", "C07", "H04"],
        "r_and_d_budget_billions": 7.3,
        "recent_acquisitions": ["Mellanox", "DeepMap"],
    },
    {
        "name": "Pfizer",
        "industry_focus": ["pharmaceuticals", "vaccines", "oncology"],
        "technology_interests": [
            "drug discovery", "mrna", "vaccine", "oncology", "gene therapy",
            "protein engineering", "biomarker", "clinical trial optimization",
        ],
        "patent_whitespace": ["G06N", "H01L", "H04"],
        "r_and_d_budget_billions": 11.4,
        "recent_acquisitions": ["Seagen", "Arena Pharmaceuticals"],
    },
    {
        "name": "Johnson & Johnson",
        "industry_focus": ["pharmaceuticals", "medical devices", "consumer health"],
        "technology_interests": [
            "medical device", "surgical robot", "immunology", "oncology",
            "diagnostic", "drug delivery", "orthopedic",
        ],
        "patent_whitespace": ["G06N", "H01L"],
        "r_and_d_budget_billions": 14.6,
        "recent_acquisitions": ["Abiomed", "Momenta Pharmaceuticals"],
    },
    {
        "name": "Merck",
        "industry_focus": ["pharmaceuticals", "vaccines", "animal health"],
        "technology_interests": [
            "immunotherapy", "vaccine", "oncology", "infectious disease",
            "biologics", "biomarker", "protein engineering",
        ],
        "patent_whitespace": ["G06N", "H01L", "G06F"],
        "r_and_d_budget_billions": 13.5,
        "recent_acquisitions": ["Prometheus Biosciences", "Imago BioSciences"],
    },
    {
        "name": "3M",
        "industry_focus": ["industrial", "materials", "healthcare"],
        "technology_interests": [
            "materials science", "adhesive", "coating", "filtration",
            "abrasive", "display film", "dental materials",
        ],
        "patent_whitespace": ["G06N", "H01L", "B64"],
        "r_and_d_budget_billions": 1.9,
        "recent_acquisitions": ["M*Modal", "Acelity"],
    },
    {
        "name": "Intel",
        "industry_focus": ["semiconductor", "computing", "ai"],
        "technology_interests": [
            "semiconductor", "chip design", "lithography", "quantum computing",
            "neuromorphic computing", "ai accelerator", "process technology",
        ],
        "patent_whitespace": ["A61", "C07", "C12"],
        "r_and_d_budget_billions": 16.0,
        "recent_acquisitions": ["Tower Semiconductor", "Granulate"],
    },
    {
        "name": "TSMC",
        "industry_focus": ["semiconductor foundry"],
        "technology_interests": [
            "semiconductor fabrication", "lithography", "process node",
            "chip packaging", "3d integration", "euv",
        ],
        "patent_whitespace": ["A61", "C07", "C12", "G06N"],
        "r_and_d_budget_billions": 5.5,
        "recent_acquisitions": [],
    },
    {
        "name": "Tesla",
        "industry_focus": ["electric vehicles", "energy", "autonomy"],
        "technology_interests": [
            "battery", "autonomous driving", "electric motor", "solar",
            "energy storage", "robotics", "manufacturing automation",
        ],
        "patent_whitespace": ["A61", "C07", "C12"],
        "r_and_d_budget_billions": 3.1,
        "recent_acquisitions": ["Grohmann Engineering", "Maxwell Technologies"],
    },
    {
        "name": "Moderna",
        "industry_focus": ["biotechnology", "mrna therapeutics"],
        "technology_interests": [
            "mrna", "vaccine", "gene therapy", "lipid nanoparticle",
            "immunology", "protein engineering", "drug delivery",
        ],
        "patent_whitespace": ["G06N", "H01L", "H04"],
        "r_and_d_budget_billions": 4.8,
        "recent_acquisitions": ["OriCiro Genomics"],
    },
    {
        "name": "Roche",
        "industry_focus": ["pharmaceuticals", "diagnostics"],
        "technology_interests": [
            "diagnostic", "oncology", "immunology", "biomarker",
            "sequencing", "companion diagnostic", "antibody",
        ],
        "patent_whitespace": ["G06N", "H01L", "H04"],
        "r_and_d_budget_billions": 14.1,
        "recent_acquisitions": ["Flatiron Health", "Foundation Medicine"],
    },
    {
        "name": "IBM",
        "industry_focus": ["enterprise technology", "consulting", "ai"],
        "technology_interests": [
            "quantum computing", "ai", "cloud", "cybersecurity",
            "blockchain", "mainframe", "enterprise automation",
        ],
        "patent_whitespace": ["A61", "C07", "C12"],
        "r_and_d_budget_billions": 6.6,
        "recent_acquisitions": ["HashiCorp", "Apptio"],
    },
    {
        "name": "Qualcomm",
        "industry_focus": ["semiconductor", "wireless", "mobile"],
        "technology_interests": [
            "5g", "wireless", "mobile processor", "modem", "rf",
            "connected vehicle", "iot", "edge ai",
        ],
        "patent_whitespace": ["A61", "C07", "C12"],
        "r_and_d_budget_billions": 8.8,
        "recent_acquisitions": ["Autotalks", "Cellwize"],
    },
    {
        "name": "Samsung",
        "industry_focus": ["semiconductor", "consumer electronics", "display"],
        "technology_interests": [
            "semiconductor", "display", "battery", "memory",
            "mobile", "5g", "foldable", "image sensor",
        ],
        "patent_whitespace": ["A61", "C07"],
        "r_and_d_budget_billions": 22.4,
        "recent_acquisitions": ["Harman International", "SmartThings"],
    },
    {
        "name": "Siemens",
        "industry_focus": ["industrial automation", "energy", "healthcare"],
        "technology_interests": [
            "industrial automation", "digital twin", "power grid",
            "medical imaging", "building automation", "rail",
        ],
        "patent_whitespace": ["G06N", "C12"],
        "r_and_d_budget_billions": 6.2,
        "recent_acquisitions": ["Brightly Software", "Sqills"],
    },
    {
        "name": "General Electric",
        "industry_focus": ["aviation", "power", "renewable energy"],
        "technology_interests": [
            "gas turbine", "wind turbine", "jet engine", "power grid",
            "additive manufacturing", "aviation sensor", "renewable energy",
        ],
        "patent_whitespace": ["G06N", "C12", "H01L"],
        "r_and_d_budget_billions": 3.4,
        "recent_acquisitions": ["LM Wind Power", "Arcam"],
    },
]


def get_all_profiles() -> list[dict]:
    """Return all hardcoded company profiles.

    Returns:
        List of company profile dicts.
    """
    return COMPANY_PROFILES


def get_profile(name: str) -> dict | None:
    """Get a specific company profile by name.

    Args:
        name: Company name.

    Returns:
        Profile dict or None.
    """
    for p in COMPANY_PROFILES:
        if p["name"].lower() == name.lower():
            return p
    return None
