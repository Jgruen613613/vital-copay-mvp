"""Technical novelty scoring via TF-IDF similarity analysis."""

from typing import Any

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


def score_technical_novelty(records: list[dict[str, Any]]) -> dict[str, float]:
    """Score each record's technical novelty based on abstract uniqueness.

    Uses TF-IDF to measure how unique each abstract is compared to the entire
    corpus. Lower similarity to the rest = higher novelty.

    Args:
        records: List of IP records with 'id' and 'abstract' fields.

    Returns:
        Dict mapping record id to novelty score (1-10).
    """
    if not records:
        return {}

    abstracts = [r.get("abstract", "") or "" for r in records]
    ids = [r["id"] for r in records]

    # Handle case where all abstracts are empty
    non_empty = [a for a in abstracts if a.strip()]
    if len(non_empty) < 2:
        return {rid: 5.0 for rid in ids}

    vectorizer = TfidfVectorizer(
        max_features=5000, stop_words="english", min_df=1, max_df=0.95
    )

    try:
        tfidf_matrix = vectorizer.fit_transform(abstracts)
    except ValueError:
        return {rid: 5.0 for rid in ids}

    sim_matrix = cosine_similarity(tfidf_matrix)

    scores = {}
    for i, rid in enumerate(ids):
        # Average similarity to all other documents
        similarities = np.concatenate([sim_matrix[i, :i], sim_matrix[i, i + 1 :]])
        if len(similarities) == 0:
            avg_sim = 0.5
        else:
            avg_sim = float(np.mean(similarities))

        # Invert: low similarity = high novelty
        # Scale from 1-10, with avg_sim 0 → 10, avg_sim 1 → 1
        novelty = 1.0 + 9.0 * (1.0 - avg_sim)
        scores[rid] = round(min(10.0, max(1.0, novelty)), 2)

    # Also consider CPC code uniqueness for patents
    cpc_counts: dict[str, int] = {}
    for r in records:
        for code in r.get("raw_metadata", {}).get("cpc_codes", []):
            cpc_counts[code] = cpc_counts.get(code, 0) + 1

    if cpc_counts:
        for r in records:
            codes = r.get("raw_metadata", {}).get("cpc_codes", [])
            if codes:
                avg_freq = np.mean([cpc_counts.get(c, 1) for c in codes])
                max_freq = max(cpc_counts.values())
                # Rare CPC combos boost novelty
                cpc_bonus = 1.0 * (1.0 - avg_freq / max_freq) if max_freq > 1 else 0.5
                scores[r["id"]] = round(
                    min(10.0, scores.get(r["id"], 5.0) + cpc_bonus), 2
                )

    return scores
