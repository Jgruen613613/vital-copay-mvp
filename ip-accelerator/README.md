# AI-Powered University IP Accelerator v1.0

A platform that discovers, evaluates, and matches university intellectual property with commercial opportunities — using only public data sources.

## Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │           IP Accelerator Pipeline            │
                    └─────────────────────────────────────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│   USPTO API     │          │   arXiv API     │          │  NIH RePORTER   │
│  PatentsView    │          │  Atom Feed      │          │   REST API      │
└────────┬────────┘          └────────┬────────┘          └────────┬────────┘
         └──────────────────────────────┼──────────────────────────────┘
                                        ▼
                              ┌─────────────────┐
                              │   Aggregator    │
                              │  Dedup + Tag    │
                              └────────┬────────┘
                                       ▼
                              ┌─────────────────┐
                              │ 10-Dimension    │
                              │   Scorer        │
                              └────────┬────────┘
                                       ▼
                              ┌─────────────────┐
                              │ AI Acceleration │
                              │   Model         │
                              └────────┬────────┘
                                       ▼
                              ┌─────────────────┐
                              │   Corporate     │
                              │   Matcher       │
                              └────────┬────────┘
                                       ▼
                    ┌─────────────────────────────────────────────┐
                    │         Streamlit Dashboard                  │
                    │  Overview │ Deep Dive │ Corporate │ Heatmap  │
                    └─────────────────────────────────────────────┘
```

## Quick Start

```bash
cd ip-accelerator

# Install dependencies
pip install -r requirements.txt

# Run pipeline with demo seed data (no API access needed)
python scripts/run_pipeline.py --seed

# Launch the dashboard
streamlit run dashboard/app.py

# Or run with live API data (fetches from USPTO, arXiv, NIH)
python scripts/run_pipeline.py
```

## What It Does

| Stage | Description | Data Source |
|-------|-------------|------------|
| **Discovery** | Fetches patents, papers, grants from 10 top universities | USPTO PatentsView, arXiv, NIH RePORTER |
| **Scoring** | Scores each IP on 10 dimensions (novelty, market, TRL, etc.) | TF-IDF, CPC codes, heuristics |
| **Acceleration** | Classifies domains, applies AI-science compression multipliers | Researched domain parameters |
| **Matching** | Matches scored IP to 20 Fortune 500 corporate buyers | Hardcoded company profiles |
| **Dashboard** | Interactive Streamlit UI with charts and deep-dive views | Pipeline outputs via Plotly |

## Scoring Dimensions

1. Technical Novelty — TF-IDF uniqueness analysis
2. Defensibility — Claims breadth, CPC coverage
3. Market Size — TAM mapping from domain/CPC codes
4. Technology Readiness Level — Keyword-based TRL classifier
5. Competitive Landscape — CPC class crowding analysis
6. Citation Momentum — Forward citation velocity
7. Inventor Quality — Patent portfolio analysis
8. Freedom to Operate — Blocking patent assessment
9. Patent Life — Remaining term calculation
10. Licensing Complexity — Co-assignee and Bayh-Dole analysis

## Project Structure

```
ip-accelerator/
├── config/settings.yaml          # Configurable parameters
├── src/
│   ├── discovery/                # Stage 1: IP Discovery
│   │   ├── uspto_fetcher.py      # USPTO PatentsView API
│   │   ├── arxiv_fetcher.py      # arXiv API
│   │   ├── nih_fetcher.py        # NIH RePORTER API
│   │   └── aggregator.py         # Combine + deduplicate
│   ├── scoring/                  # Stage 2: Multi-Dimensional Scoring
│   │   ├── technical_novelty.py  # TF-IDF novelty analysis
│   │   ├── market_size.py        # TAM mapping
│   │   ├── citation_momentum.py  # Citation velocity
│   │   ├── inventor_quality.py   # Inventor portfolio
│   │   ├── dimensions.py         # Other 6 dimensions
│   │   └── composite.py          # Weighted composite scorer
│   ├── acceleration/             # Stage 3: AI-Science Acceleration
│   │   ├── domain_classifier.py  # 15-domain classifier
│   │   ├── acceleration_model.py # Value multiplier model
│   │   └── domain_configs.yaml   # Per-domain parameters
│   ├── matching/                 # Stage 4: Corporate Matchmaking
│   │   ├── company_profiler.py   # 20 company profiles
│   │   └── matcher.py            # IP-to-company matching
│   ├── pipeline.py               # Full pipeline orchestrator
│   └── utils/                    # Rate limiter + cache
├── dashboard/app.py              # Streamlit dashboard
├── scripts/
│   ├── run_pipeline.py           # CLI entry point
│   └── seed_data.py              # Demo data generator
├── tests/                        # Unit + integration tests
└── data/outputs/                 # Pipeline results (JSON + CSV)
```

## Dashboard Views

- **Overview** — Record counts, score distributions, top 20 table
- **IP Deep Dive** — 10-dimension radar chart, acceleration analysis, corporate matches
- **Corporate View** — Select a company, see matched IP ranked by fit
- **AI Acceleration Heatmap** — 15 domains × acceleration parameters

## Configuration

Edit `config/settings.yaml` to adjust:
- Target universities
- Scoring dimension weights
- Discovery limits and date ranges
- Pipeline caching and rate limiting

## CLI Options

```bash
# Run all stages
python scripts/run_pipeline.py

# Run specific stages
python scripts/run_pipeline.py --stages discovery scoring

# Verbose logging
python scripts/run_pipeline.py -v

# Demo mode with seed data
python scripts/run_pipeline.py --seed
```
