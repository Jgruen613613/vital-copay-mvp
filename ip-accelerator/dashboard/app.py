"""Streamlit dashboard for the IP Accelerator."""

import json
import sys
from pathlib import Path

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import numpy as np

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.matching.company_profiler import get_all_profiles
from src.acceleration.acceleration_model import load_domain_configs

RESULTS_PATH = PROJECT_ROOT / "data" / "outputs" / "pipeline_results.json"


@st.cache_data
def load_data():
    """Load pipeline results."""
    if RESULTS_PATH.exists():
        with open(RESULTS_PATH) as f:
            return json.load(f)
    return []


def main():
    st.set_page_config(
        page_title="IP Accelerator Dashboard",
        page_icon="🔬",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    st.title("AI-Powered University IP Accelerator")
    st.caption("Discovery → Scoring → AI Acceleration → Corporate Matchmaking")

    records = load_data()

    if not records:
        st.warning(
            "No pipeline results found. Run the pipeline first:\n\n"
            "```bash\ncd ip-accelerator\npython scripts/run_pipeline.py --seed\n```"
        )
        return

    df = pd.DataFrame(records)

    # Sidebar navigation
    page = st.sidebar.radio(
        "Navigate",
        ["Overview", "IP Deep Dive", "Corporate View", "AI Acceleration Heatmap"],
    )

    if page == "Overview":
        render_overview(df, records)
    elif page == "IP Deep Dive":
        render_deep_dive(df, records)
    elif page == "Corporate View":
        render_corporate_view(df, records)
    elif page == "AI Acceleration Heatmap":
        render_heatmap()


def render_overview(df: pd.DataFrame, records: list):
    """Render the overview page."""
    st.header("Pipeline Overview")

    # Key metrics
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total IP Records", len(records))
    with col2:
        avg_score = df["composite_score"].mean() if "composite_score" in df else 0
        st.metric("Avg Composite Score", f"{avg_score:.2f}")
    with col3:
        avg_adj = df["adjusted_composite_score"].mean() if "adjusted_composite_score" in df else 0
        st.metric("Avg Adjusted Score", f"{avg_adj:.2f}")
    with col4:
        sources = df["source"].nunique() if "source" in df else 0
        st.metric("Data Sources", sources)

    st.divider()

    # Source distribution
    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Records by Source")
        if "source" in df:
            source_counts = df["source"].value_counts()
            fig = px.pie(
                values=source_counts.values,
                names=source_counts.index,
                color_discrete_sequence=px.colors.qualitative.Set2,
            )
            fig.update_layout(height=350)
            st.plotly_chart(fig, use_container_width=True)

    with col2:
        st.subheader("Score Distribution")
        if "composite_score" in df:
            fig = px.histogram(
                df, x="composite_score", nbins=20,
                labels={"composite_score": "Composite Score"},
                color_discrete_sequence=["#4A90D9"],
            )
            fig.update_layout(height=350)
            st.plotly_chart(fig, use_container_width=True)

    st.divider()

    # Top 20 table
    st.subheader("Top 20 Highest-Scored IP Records")
    top_20 = df.nlargest(20, "adjusted_composite_score") if "adjusted_composite_score" in df else df.head(20)

    display_cols = ["id", "title", "institution", "source",
                    "composite_score", "acceleration_domain",
                    "acceleration_multiplier", "adjusted_composite_score"]
    available_cols = [c for c in display_cols if c in top_20.columns]
    st.dataframe(
        top_20[available_cols],
        use_container_width=True,
        hide_index=True,
    )

    # Records by institution
    st.subheader("Records by Institution")
    if "institution" in df:
        inst_counts = df["institution"].value_counts()
        fig = px.bar(
            x=inst_counts.index, y=inst_counts.values,
            labels={"x": "Institution", "y": "Count"},
            color_discrete_sequence=["#4A90D9"],
        )
        fig.update_layout(height=400, xaxis_tickangle=-45)
        st.plotly_chart(fig, use_container_width=True)


def render_deep_dive(df: pd.DataFrame, records: list):
    """Render the IP deep dive page."""
    st.header("IP Deep Dive")

    titles = {r.get("title", "Untitled"): i for i, r in enumerate(records)}
    selected_title = st.selectbox("Select an IP Record", list(titles.keys()))

    if selected_title:
        rec = records[titles[selected_title]]

        col1, col2 = st.columns([2, 1])
        with col1:
            st.subheader(rec.get("title", ""))
            st.markdown(f"**Source:** {rec.get('source', '').upper()} | "
                       f"**Institution:** {rec.get('institution', '')} | "
                       f"**Date:** {rec.get('date', '')}")
            st.markdown(f"**ID:** `{rec.get('id', '')}`")

            with st.expander("Abstract", expanded=True):
                st.write(rec.get("abstract", "No abstract available."))

            with st.expander("Authors / Inventors"):
                authors = rec.get("authors", [])
                st.write(", ".join(authors) if authors else "Not available")

        with col2:
            st.metric("Composite Score", f"{rec.get('composite_score', 0):.2f}")
            st.metric("Acceleration Multiplier", f"{rec.get('acceleration_multiplier', 1.0):.2f}x")
            st.metric("Adjusted Score", f"{rec.get('adjusted_composite_score', 0):.2f}")
            st.metric("Domain", rec.get("acceleration_domain", "N/A").replace("_", " ").title())
            st.metric("Confidence", rec.get("confidence_level", "N/A").title())

        st.divider()

        # Radar chart of 10 dimensions
        dim_scores = rec.get("dimension_scores", {})
        if dim_scores:
            st.subheader("10-Dimension Scoring Radar")
            categories = list(dim_scores.keys())
            values = list(dim_scores.values())
            # Close the radar
            categories_closed = categories + [categories[0]]
            values_closed = values + [values[0]]

            fig = go.Figure()
            fig.add_trace(go.Scatterpolar(
                r=values_closed,
                theta=[c.replace("_", " ").title() for c in categories_closed],
                fill="toself",
                name="Scores",
                line_color="#4A90D9",
            ))
            fig.update_layout(
                polar=dict(radialaxis=dict(visible=True, range=[0, 10])),
                height=450,
            )
            st.plotly_chart(fig, use_container_width=True)

        # Acceleration rationale
        if rec.get("acceleration_rationale"):
            st.subheader("AI Acceleration Analysis")
            st.info(rec["acceleration_rationale"])

        # Corporate matches
        matches = rec.get("corporate_matches", [])
        if matches:
            st.subheader("Top 5 Corporate Matches")
            for i, m in enumerate(matches, 1):
                with st.container():
                    col1, col2, col3 = st.columns([1, 2, 1])
                    with col1:
                        st.markdown(f"**#{i} {m['company']}**")
                    with col2:
                        st.markdown(f"_{m['rationale']}_")
                    with col3:
                        st.metric("Match Score", f"{m['match_score']:.0f}/100",
                                 label_visibility="collapsed")
                    st.divider()


def render_corporate_view(df: pd.DataFrame, records: list):
    """Render the corporate view page."""
    st.header("Corporate Buyer View")

    profiles = get_all_profiles()
    company_names = [p["name"] for p in profiles]
    selected = st.selectbox("Select a Company", company_names)

    profile = next(p for p in profiles if p["name"] == selected)

    col1, col2 = st.columns([1, 1])
    with col1:
        st.subheader(f"{profile['name']} Profile")
        st.markdown(f"**Industry Focus:** {', '.join(profile['industry_focus'])}")
        st.markdown(f"**R&D Budget:** ${profile['r_and_d_budget_billions']}B")
        st.markdown(f"**Technology Interests:** {', '.join(profile['technology_interests'][:6])}")
        if profile.get("recent_acquisitions"):
            st.markdown(f"**Recent Acquisitions:** {', '.join(profile['recent_acquisitions'])}")

    with col2:
        st.subheader("Patent Whitespace (CPC Gaps)")
        for ws in profile.get("patent_whitespace", []):
            st.code(ws, language=None)

    st.divider()
    st.subheader(f"Matched IP for {profile['name']}")

    # Find all records that have this company in their top matches
    matched_records = []
    for rec in records:
        for m in rec.get("corporate_matches", []):
            if m["company"] == selected:
                matched_records.append({
                    "title": rec.get("title", ""),
                    "institution": rec.get("institution", ""),
                    "domain": rec.get("acceleration_domain", ""),
                    "composite_score": rec.get("composite_score", 0),
                    "match_score": m["match_score"],
                    "rationale": m["rationale"],
                })
                break

    if matched_records:
        match_df = pd.DataFrame(matched_records)
        match_df = match_df.sort_values("match_score", ascending=False)

        # Whitespace analysis chart
        if "domain" in match_df.columns:
            domain_counts = match_df["domain"].value_counts()
            fig = px.bar(
                x=domain_counts.index,
                y=domain_counts.values,
                labels={"x": "Technology Domain", "y": "Matched IP Count"},
                title=f"IP Matches by Domain for {selected}",
                color_discrete_sequence=["#4A90D9"],
            )
            fig.update_layout(height=350, xaxis_tickangle=-45)
            st.plotly_chart(fig, use_container_width=True)

        st.dataframe(match_df, use_container_width=True, hide_index=True)
    else:
        st.info(f"No IP records matched to {selected} in the current dataset.")


def render_heatmap():
    """Render the AI acceleration heatmap."""
    st.header("AI-Science Acceleration Heatmap")
    st.caption("Showing how AI accelerates R&D across 15 technology domains")

    configs = load_domain_configs()

    domains = []
    compression = []
    maturity = []
    trend = []
    combined = []

    for domain, cfg in configs.items():
        domains.append(domain.replace("_", " ").title())
        c = cfg.get("ai_compression_factor", 1.0)
        m = cfg.get("current_ai_maturity", 0.0)
        t = cfg.get("acceleration_trend", 1.0)
        compression.append(c)
        maturity.append(m)
        trend.append(t)
        combined.append(round(c * m * t, 2))

    params = ["Compression Factor", "AI Maturity", "Acceleration Trend", "Combined Impact"]
    z_data = np.array([compression, maturity, trend, combined]).T

    # Normalize each column for color mapping
    z_norm = np.zeros_like(z_data)
    for j in range(z_data.shape[1]):
        col = z_data[:, j]
        col_min, col_max = col.min(), col.max()
        if col_max > col_min:
            z_norm[:, j] = (col - col_min) / (col_max - col_min)
        else:
            z_norm[:, j] = 0.5

    fig = go.Figure(data=go.Heatmap(
        z=z_norm,
        x=params,
        y=domains,
        text=z_data,
        texttemplate="%{text:.1f}",
        colorscale="YlOrRd",
        showscale=True,
        colorbar_title="Normalized",
    ))
    fig.update_layout(
        height=600,
        xaxis_title="Acceleration Parameters",
        yaxis_title="Technology Domain",
        yaxis_autorange="reversed",
    )
    st.plotly_chart(fig, use_container_width=True)

    # Domain details expander
    st.divider()
    st.subheader("Domain Details")
    for domain, cfg in configs.items():
        with st.expander(domain.replace("_", " ").title()):
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Compression Factor", f"{cfg.get('ai_compression_factor', 0)}x")
            with col2:
                st.metric("AI Maturity", f"{cfg.get('current_ai_maturity', 0):.0%}")
            with col3:
                st.metric("Trend", f"{cfg.get('acceleration_trend', 0)}x")
            examples = cfg.get("example_breakthroughs", [])
            if examples:
                st.markdown("**Key Breakthroughs:**")
                for ex in examples:
                    st.markdown(f"- {ex}")


if __name__ == "__main__":
    main()
