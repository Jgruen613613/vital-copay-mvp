#!/usr/bin/env python3
"""Generate realistic seed data for demo purposes."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

SEED_RECORDS = [
    {
        "id": "USPTO-11234567",
        "source": "uspto",
        "title": "Machine Learning System for Protein Structure Prediction Using Graph Neural Networks",
        "abstract": "A computational method and system for predicting three-dimensional protein structures using graph neural networks. The method processes amino acid sequences through a multi-layer graph attention network to predict inter-residue distances and torsion angles, enabling rapid protein folding prediction without molecular dynamics simulation. The system demonstrates accuracy comparable to experimental methods while reducing computational time from days to minutes.",
        "institution": "Massachusetts Institute of Technology",
        "authors": ["Sarah Chen", "David Park", "Michael Rodriguez"],
        "date": "2024-06-15",
        "domain_tags": ["protein_engineering", "ai_ml"],
        "raw_metadata": {
            "patent_number": "11234567",
            "num_claims": 24,
            "forward_citations": 15,
            "cpc_codes": ["G16B15/30", "G06N3/08", "C12N15/10"],
            "assignees": ["Massachusetts Institute of Technology"]
        }
    },
    {
        "id": "USPTO-11345678",
        "source": "uspto",
        "title": "Autonomous Catalyst Discovery Platform Using Bayesian Optimization",
        "abstract": "An automated laboratory system for discovering novel catalysts for green hydrogen production through water electrolysis. The platform combines robotic sample preparation, high-throughput electrochemical testing, and Bayesian optimization to efficiently explore catalyst composition space. The system identified several non-precious metal catalysts with performance exceeding platinum-based benchmarks, demonstrating potential for reducing hydrogen production costs by 40%.",
        "institution": "Stanford University",
        "authors": ["Emily Zhang", "Robert Kim", "Lisa Wang"],
        "date": "2024-03-22",
        "domain_tags": ["climate_energy", "materials_science", "ai_ml"],
        "raw_metadata": {
            "patent_number": "11345678",
            "num_claims": 18,
            "forward_citations": 8,
            "cpc_codes": ["C25B1/04", "B01J23/00", "G06N7/01"],
            "assignees": ["Stanford University"]
        }
    },
    {
        "id": "USPTO-11456789",
        "source": "uspto",
        "title": "Quantum Error Correction Code for Topological Qubit Arrays",
        "abstract": "A novel quantum error correction scheme designed for topological qubit architectures that achieves fault tolerance with fewer physical qubits than existing surface codes. The method uses a hierarchical decoding algorithm that reduces classical computational overhead while maintaining error thresholds suitable for practical quantum computation. Demonstrated in simulation with 99.9% logical error suppression using only 49 physical qubits per logical qubit.",
        "institution": "California Institute of Technology",
        "authors": ["James Liu", "Anna Petrova"],
        "date": "2024-08-10",
        "domain_tags": ["quantum_computing"],
        "raw_metadata": {
            "patent_number": "11456789",
            "num_claims": 15,
            "forward_citations": 22,
            "cpc_codes": ["G06N10/70", "H03M13/00"],
            "assignees": ["California Institute of Technology"]
        }
    },
    {
        "id": "USPTO-11567890",
        "source": "uspto",
        "title": "CRISPR-Based Diagnostic Platform for Rapid Pathogen Detection",
        "abstract": "A point-of-care diagnostic device that leverages CRISPR-Cas13 for rapid, multiplexed detection of respiratory pathogens including influenza, SARS-CoV-2, and RSV. The device uses lateral flow readout combined with isothermal amplification to deliver results in under 30 minutes without laboratory equipment. The platform demonstrated 98% sensitivity and 99% specificity in clinical validation with 500 patient samples.",
        "institution": "Johns Hopkins University",
        "authors": ["Maria Santos", "Kevin O'Brien", "Priya Patel"],
        "date": "2024-01-18",
        "domain_tags": ["medical_diagnostics", "synthetic_biology"],
        "raw_metadata": {
            "patent_number": "11567890",
            "num_claims": 32,
            "forward_citations": 12,
            "cpc_codes": ["C12Q1/6886", "G01N33/569", "C12N15/113"],
            "assignees": ["Johns Hopkins University"]
        }
    },
    {
        "id": "USPTO-11678901",
        "source": "uspto",
        "title": "Neuromorphic Computing Architecture for Edge AI Applications",
        "abstract": "A novel neuromorphic processor architecture that implements spiking neural networks in silicon for ultra-low-power edge AI applications. The chip achieves 100x energy efficiency improvement over conventional GPUs for inference tasks while maintaining competitive accuracy on standard benchmarks. The architecture supports on-chip learning through spike-timing-dependent plasticity, enabling continuous adaptation in deployment.",
        "institution": "University of Michigan",
        "authors": ["Thomas Brown", "Wei Lin", "Jennifer Adams"],
        "date": "2024-05-03",
        "domain_tags": ["semiconductor", "ai_ml"],
        "raw_metadata": {
            "patent_number": "11678901",
            "num_claims": 28,
            "forward_citations": 19,
            "cpc_codes": ["G06N3/063", "H01L27/00", "G06F15/80"],
            "assignees": ["University of Michigan"]
        }
    },
    {
        "id": "USPTO-11789012",
        "source": "uspto",
        "title": "Self-Healing Polymer Composite for Structural Applications",
        "abstract": "A self-healing polymer composite material incorporating microencapsulated healing agents and shape memory alloy fibers for autonomous damage repair in structural applications. The material demonstrates 95% recovery of mechanical properties after impact damage through a dual healing mechanism combining chemical bonding and physical realignment. Validated for aerospace and automotive structural components with service temperatures up to 150°C.",
        "institution": "Georgia Institute of Technology",
        "authors": ["Alexandra Foster", "Raj Gupta"],
        "date": "2024-09-27",
        "domain_tags": ["materials_science", "aerospace"],
        "raw_metadata": {
            "patent_number": "11789012",
            "num_claims": 20,
            "forward_citations": 6,
            "cpc_codes": ["C08L63/00", "B29C73/00", "B64C1/00"],
            "assignees": ["Georgia Institute of Technology"]
        }
    },
    {
        "id": "ARXIV-2024.12345",
        "source": "arxiv",
        "title": "Diffusion Models for De Novo Drug Design with Multi-Objective Optimization",
        "abstract": "We present a diffusion-based generative model for de novo small molecule drug design that simultaneously optimizes for binding affinity, drug-likeness, and synthetic accessibility. Our model generates molecules conditioned on protein binding site geometry and achieves state-of-the-art performance on standard benchmarks. In prospective validation against three oncology targets, 60% of generated molecules showed sub-micromolar activity in biochemical assays.",
        "institution": "Stanford University",
        "authors": ["Andrew Lee", "Jessica Wu", "Mark Thompson"],
        "date": "2024-11-15",
        "domain_tags": ["drug_discovery", "ai_ml"],
        "raw_metadata": {
            "arxiv_id": "2024.12345",
            "categories": ["cs.LG", "q-bio.BM"],
            "pdf_url": "https://arxiv.org/pdf/2024.12345"
        }
    },
    {
        "id": "ARXIV-2024.23456",
        "source": "arxiv",
        "title": "Foundation Model for Autonomous Robot Manipulation in Unstructured Environments",
        "abstract": "We introduce RoboFoundation, a large vision-language-action model for robotic manipulation that generalizes across diverse objects, environments, and tasks without task-specific training. The model is pre-trained on 1M+ hours of manipulation demonstrations and fine-tuned with reinforcement learning. We demonstrate zero-shot transfer to novel objects with 85% success rate and rapid adaptation to new tasks within 10 demonstrations.",
        "institution": "Carnegie Mellon University",
        "authors": ["Daniel Cho", "Rachel Green", "Amit Sharma"],
        "date": "2024-10-08",
        "domain_tags": ["autonomous_systems", "ai_ml"],
        "raw_metadata": {
            "arxiv_id": "2024.23456",
            "categories": ["cs.RO", "cs.AI", "cs.LG"],
            "pdf_url": "https://arxiv.org/pdf/2024.23456"
        }
    },
    {
        "id": "NIH-R01AI170001",
        "source": "nih",
        "title": "AI-Guided mRNA Vaccine Design for Emerging Infectious Diseases",
        "abstract": "This project develops an artificial intelligence platform for rapid design and optimization of mRNA vaccine candidates against emerging infectious diseases. The system integrates protein structure prediction, immune epitope mapping, and codon optimization using deep learning to generate vaccine constructs within 48 hours of pathogen sequence availability. The platform will be validated against three emerging viral threats identified by WHO priority pathogen list.",
        "institution": "Columbia University",
        "authors": ["Helen Park", "Christopher Davis"],
        "date": "2024-04-01",
        "domain_tags": ["drug_discovery", "protein_engineering", "ai_ml"],
        "raw_metadata": {
            "project_num": "R01AI170001",
            "activity_code": "R01",
            "award_amount": 2500000,
            "project_start_date": "2024-04-01",
            "project_end_date": "2029-03-31",
            "spending_categories": None,
            "organization": "Columbia University"
        }
    },
    {
        "id": "NIH-R01GM180002",
        "source": "nih",
        "title": "Computational Design of Metalloenzymes for Carbon Dioxide Reduction",
        "abstract": "This research program combines computational protein design with directed evolution to engineer novel metalloenzymes capable of efficient carbon dioxide reduction to value-added chemicals. Using machine learning-guided protein engineering, we aim to create biocatalysts that operate at ambient conditions with selectivity exceeding 95% for C2+ products. The project integrates quantum mechanical modeling of active sites with generative protein design algorithms.",
        "institution": "University of California Berkeley",
        "authors": ["Nathan Williams", "Sophia Rivera", "George Taylor"],
        "date": "2024-07-01",
        "domain_tags": ["protein_engineering", "climate_energy", "synthetic_biology"],
        "raw_metadata": {
            "project_num": "R01GM180002",
            "activity_code": "R01",
            "award_amount": 1800000,
            "project_start_date": "2024-07-01",
            "project_end_date": "2028-06-30",
            "spending_categories": None,
            "organization": "University of California Berkeley"
        }
    },
    {
        "id": "USPTO-11890123",
        "source": "uspto",
        "title": "Solid-State Lithium Battery with AI-Designed Electrolyte",
        "abstract": "A solid-state lithium battery incorporating a novel ceramic electrolyte composition discovered through machine learning-guided materials screening. The electrolyte demonstrates ionic conductivity of 10 mS/cm at room temperature, approaching liquid electrolyte performance while maintaining the safety advantages of solid-state design. The battery achieves 500 Wh/kg energy density with 80% capacity retention after 1000 cycles.",
        "institution": "Stanford University",
        "authors": ["Michelle Chen", "Ryan Park", "David Kim"],
        "date": "2024-02-14",
        "domain_tags": ["climate_energy", "materials_science"],
        "raw_metadata": {
            "patent_number": "11890123",
            "num_claims": 22,
            "forward_citations": 31,
            "cpc_codes": ["H01M10/0562", "H01M10/052", "C04B35/00"],
            "assignees": ["Stanford University"]
        }
    },
    {
        "id": "USPTO-11901234",
        "source": "uspto",
        "title": "Privacy-Preserving Federated Learning Framework for Medical Imaging",
        "abstract": "A federated learning framework that enables collaborative training of medical imaging AI models across hospitals without sharing patient data. The system incorporates differential privacy guarantees, secure aggregation protocols, and model watermarking for intellectual property protection. Validated across 12 hospital sites for chest X-ray classification, achieving performance within 2% of centralized training while maintaining strict HIPAA compliance.",
        "institution": "Carnegie Mellon University",
        "authors": ["Laura Nguyen", "Eric Johnson", "Maya Gupta"],
        "date": "2024-07-22",
        "domain_tags": ["ai_ml", "medical_diagnostics", "cybersecurity"],
        "raw_metadata": {
            "patent_number": "11901234",
            "num_claims": 26,
            "forward_citations": 9,
            "cpc_codes": ["G06N20/00", "G16H30/40", "H04L9/00"],
            "assignees": ["Carnegie Mellon University"]
        }
    },
    {
        "id": "ARXIV-2024.34567",
        "source": "arxiv",
        "title": "Large Language Models for Automated Vulnerability Discovery in Source Code",
        "abstract": "We present SecureLLM, a large language model fine-tuned for automated security vulnerability discovery in source code. The model is trained on 2M+ labeled code snippets spanning 15 vulnerability categories from the CWE database. SecureLLM achieves 92% precision and 87% recall on held-out test sets, outperforming existing static analysis tools by 35% in false-positive-adjusted detection rate. We demonstrate practical deployment in CI/CD pipelines processing 10,000+ commits per day.",
        "institution": "Massachusetts Institute of Technology",
        "authors": ["Brian Martinez", "Kelly Wong"],
        "date": "2024-12-01",
        "domain_tags": ["cybersecurity", "ai_ml"],
        "raw_metadata": {
            "arxiv_id": "2024.34567",
            "categories": ["cs.CR", "cs.SE", "cs.AI"],
            "pdf_url": "https://arxiv.org/pdf/2024.34567"
        }
    },
    {
        "id": "USPTO-12012345",
        "source": "uspto",
        "title": "Biodegradable Microelectronics for Precision Agriculture Soil Monitoring",
        "abstract": "A biodegradable wireless sensor system for continuous soil health monitoring in precision agriculture applications. The sensors measure soil moisture, nutrient levels, pH, and microbial activity with millimeter-scale spatial resolution. Fabricated from silk fibroin and zinc oxide, the devices fully decompose within one growing season, eliminating electronic waste. The system includes a mesh networking protocol optimized for underground RF propagation.",
        "institution": "University of Wisconsin",
        "authors": ["Patricia Lee", "Hiroshi Tanaka"],
        "date": "2024-04-30",
        "domain_tags": ["agriculture", "materials_science"],
        "raw_metadata": {
            "patent_number": "12012345",
            "num_claims": 16,
            "forward_citations": 4,
            "cpc_codes": ["A01G25/167", "H04W84/18", "G01N33/24"],
            "assignees": ["University of Wisconsin"]
        }
    },
    {
        "id": "NIH-U01CA210003",
        "source": "nih",
        "title": "AI-Powered Multimodal Cancer Early Detection Platform",
        "abstract": "Development of an artificial intelligence platform integrating liquid biopsy proteomics, cell-free DNA methylation profiling, and clinical imaging for multi-cancer early detection. The system employs transformer-based models trained on longitudinal data from 50,000 participants to identify cancer signals across 12 organ sites at stage I/II with 95% specificity. This project aims to validate the platform in a prospective study of 10,000 average-risk adults.",
        "institution": "Johns Hopkins University",
        "authors": ["Robert Chen", "Amanda Foster", "William Park"],
        "date": "2024-09-01",
        "domain_tags": ["medical_diagnostics", "ai_ml"],
        "raw_metadata": {
            "project_num": "U01CA210003",
            "activity_code": "U01",
            "award_amount": 5200000,
            "project_start_date": "2024-09-01",
            "project_end_date": "2029-08-31",
            "spending_categories": None,
            "organization": "Johns Hopkins University"
        }
    },
    {
        "id": "USPTO-12123456",
        "source": "uspto",
        "title": "GaN Power Semiconductor with AI-Optimized Device Architecture",
        "abstract": "A gallium nitride power semiconductor device featuring an architecture optimized through neural network-guided design space exploration. The device achieves breakdown voltage of 1200V with on-resistance of 25 mΩ·cm², representing a 40% improvement in the Baliga figure of merit compared to commercial GaN devices. The AI-optimized field plate geometry and buffer layer composition reduce current collapse to less than 5%.",
        "institution": "Massachusetts Institute of Technology",
        "authors": ["Jason Wu", "Sandra Kim", "Paolo Romano"],
        "date": "2024-11-08",
        "domain_tags": ["semiconductor"],
        "raw_metadata": {
            "patent_number": "12123456",
            "num_claims": 19,
            "forward_citations": 7,
            "cpc_codes": ["H01L29/778", "H01L29/205", "G06N3/08"],
            "assignees": ["Massachusetts Institute of Technology"]
        }
    },
    {
        "id": "ARXIV-2024.45678",
        "source": "arxiv",
        "title": "Scalable Quantum Machine Learning for Financial Portfolio Optimization",
        "abstract": "We demonstrate a hybrid quantum-classical algorithm for portfolio optimization that scales to 1000+ assets using variational quantum eigensolver with problem-specific ansatz design. Our approach achieves solutions within 0.5% of the classical optimum while showing polynomial speedup potential on near-term quantum hardware. Backtesting on 10 years of S&P 500 data shows 2.3% annual alpha improvement over classical mean-variance optimization.",
        "institution": "Columbia University",
        "authors": ["Alexander Petrov", "Diana Chang"],
        "date": "2024-08-20",
        "domain_tags": ["quantum_computing", "financial", "ai_ml"],
        "raw_metadata": {
            "arxiv_id": "2024.45678",
            "categories": ["quant-ph", "q-fin.PM", "cs.LG"],
            "pdf_url": "https://arxiv.org/pdf/2024.45678"
        }
    },
    {
        "id": "USPTO-12234567",
        "source": "uspto",
        "title": "Hypersonic Vehicle Thermal Protection System Using Functionally Graded Materials",
        "abstract": "A thermal protection system for hypersonic vehicles utilizing functionally graded ceramic-metal composites manufactured through directed energy deposition additive manufacturing. The system provides continuous thermal resistance from 2000°C surface temperatures to structural aluminum interfaces, eliminating traditional tile-based TPS failure modes. Computational fluid dynamics and finite element analysis validated performance at Mach 7+ conditions.",
        "institution": "Georgia Institute of Technology",
        "authors": ["Mark Anderson", "Yuki Nakamura", "Rebecca Stone"],
        "date": "2024-06-30",
        "domain_tags": ["aerospace", "materials_science"],
        "raw_metadata": {
            "patent_number": "12234567",
            "num_claims": 14,
            "forward_citations": 3,
            "cpc_codes": ["B64G1/58", "C04B35/565", "B33Y10/00"],
            "assignees": ["Georgia Institute of Technology"]
        }
    },
    {
        "id": "NIH-R01HL190004",
        "source": "nih",
        "title": "Wearable Biosensor Array for Continuous Cardiac Biomarker Monitoring",
        "abstract": "Development of a flexible, wearable biosensor array for continuous real-time monitoring of cardiac biomarkers including troponin, BNP, and CRP through interstitial fluid sampling via microneedle extraction. The device integrates aptamer-based electrochemical sensors with on-chip signal processing and wireless data transmission. Machine learning algorithms analyze temporal biomarker patterns to predict cardiac events 6-12 hours before clinical presentation.",
        "institution": "University of Michigan",
        "authors": ["Catherine Blake", "Omar Hassan"],
        "date": "2024-03-01",
        "domain_tags": ["medical_diagnostics", "materials_science"],
        "raw_metadata": {
            "project_num": "R01HL190004",
            "activity_code": "R01",
            "award_amount": 3100000,
            "project_start_date": "2024-03-01",
            "project_end_date": "2028-02-28",
            "spending_categories": None,
            "organization": "University of Michigan"
        }
    },
    {
        "id": "USPTO-12345678",
        "source": "uspto",
        "title": "Next-Generation mRNA Delivery System Using pH-Responsive Lipid Nanoparticles",
        "abstract": "A lipid nanoparticle formulation for mRNA delivery featuring pH-responsive ionizable lipids designed through computational molecular dynamics screening. The nanoparticles achieve 10-fold improvement in endosomal escape efficiency and enable organ-selective mRNA delivery through surface ligand modifications. Demonstrated protein expression levels 5x higher than benchmark LNP formulations in non-human primate studies with favorable safety profile.",
        "institution": "Columbia University",
        "authors": ["Diana Morrison", "Frank Li", "Grace Kim"],
        "date": "2024-10-15",
        "domain_tags": ["drug_discovery", "protein_engineering"],
        "raw_metadata": {
            "patent_number": "12345678",
            "num_claims": 30,
            "forward_citations": 14,
            "cpc_codes": ["A61K9/5123", "A61K48/0008", "C12N15/88"],
            "assignees": ["Columbia University"]
        }
    },
]


def generate_seed_data() -> list[dict]:
    """Generate seed data records for demo purposes.

    Returns:
        List of realistic IP records.
    """
    return SEED_RECORDS


def save_seed_data(records: list[dict] | None = None):
    """Save seed data to the processed directory.

    Args:
        records: Records to save. Generates fresh if None.
    """
    if records is None:
        records = generate_seed_data()

    output_dir = Path(__file__).resolve().parent.parent / "data" / "processed"
    output_dir.mkdir(parents=True, exist_ok=True)

    path = output_dir / "discovery.json"
    with open(path, "w") as f:
        json.dump(records, f, indent=2)

    print(f"Saved {len(records)} seed records to {path}")
    return records


if __name__ == "__main__":
    save_seed_data()
