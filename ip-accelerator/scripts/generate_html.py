#!/usr/bin/env python3
"""Generate a standalone HTML dashboard from pipeline results."""

import json
import yaml
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
RESULTS_PATH = BASE / "data" / "outputs" / "pipeline_results.json"
CONFIGS_PATH = BASE / "src" / "acceleration" / "domain_configs.yaml"
OUTPUT_PATH = BASE / "dashboard" / "index.html"


def main():
    with open(RESULTS_PATH) as f:
        records = json.load(f)

    with open(CONFIGS_PATH) as f:
        configs = yaml.safe_load(f)

    # --- Compute aggregates ---
    total = len(records)
    avg_composite = sum(r.get("composite_score", 0) for r in records) / total if total else 0
    avg_adjusted = sum(r.get("adjusted_composite_score", 0) for r in records) / total if total else 0

    source_counts = {}
    for r in records:
        s = r.get("source", "unknown").upper()
        source_counts[s] = source_counts.get(s, 0) + 1

    domain_counts = {}
    for r in records:
        d = r.get("acceleration_domain", "general").replace("_", " ").title()
        domain_counts[d] = domain_counts.get(d, 0) + 1

    # --- Embed all record data as JSON in the HTML ---
    records_json = json.dumps(records, indent=None)

    # --- Build heatmap data ---
    heatmap_data = []
    for domain, cfg in configs.items():
        c = cfg.get("ai_compression_factor", 1.0)
        m = cfg.get("current_ai_maturity", 0.0)
        t = cfg.get("acceleration_trend", 1.0)
        heatmap_data.append({
            "domain": domain.replace("_", " ").title(),
            "compression": c,
            "maturity": m,
            "trend": t,
            "combined": round(c * m * t, 2),
        })
    heatmap_json = json.dumps(heatmap_data)

    # --- Source metric cards HTML ---
    source_cards = ""
    for k, v in source_counts.items():
        source_cards += f'<div class="stat-card"><div class="stat-value">{v}</div><div class="stat-label">{k}</div></div>\n'

    # --- Domain bars HTML ---
    max_domain = max(domain_counts.values()) if domain_counts else 1
    domain_bars = ""
    for d, c in sorted(domain_counts.items(), key=lambda x: -x[1]):
        pct = (c / max_domain) * 100
        domain_bars += f'<div class="bar-row"><span class="bar-label">{d}</span><div class="bar-container"><div class="bar" style="width:{pct:.0f}%">{c}</div></div></div>\n'

    # --- Build HTML ---
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>IP Accelerator Dashboard</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0f1117;color:#e0e0e0;min-height:100vh}}
.header{{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:28px 40px;border-bottom:2px solid #4A90D9}}
.header h1{{font-size:26px;color:#fff;margin-bottom:4px}}
.header p{{color:#8899aa;font-size:13px}}
.nav{{background:#1a1a2e;padding:0 40px;border-bottom:1px solid #2a2a3e;display:flex;gap:0}}
.nav-btn{{padding:14px 28px;background:none;border:none;color:#8899aa;font-size:14px;cursor:pointer;border-bottom:3px solid transparent;transition:all .2s;font-weight:500}}
.nav-btn:hover{{color:#fff;background:#2a2a3e}}
.nav-btn.active{{color:#4A90D9;border-bottom-color:#4A90D9}}
.content{{padding:30px 40px;max-width:1500px;margin:0 auto}}
.page{{display:none}}.page.active{{display:block}}
.metrics{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:30px}}
.stat-card{{background:#1a1a2e;border:1px solid #2a2a3e;border-radius:10px;padding:20px;text-align:center}}
.stat-value{{font-size:30px;font-weight:700;color:#4A90D9}}
.stat-label{{font-size:12px;color:#8899aa;margin-top:4px;text-transform:uppercase;letter-spacing:.5px}}
h2{{font-size:19px;margin-bottom:14px;color:#fff}}
h3{{font-size:15px;margin-bottom:10px;color:#ccc}}
.section{{margin-bottom:30px}}
table{{width:100%;border-collapse:collapse;font-size:13px}}
th{{background:#1a1a2e;color:#8899aa;padding:10px 8px;text-align:left;border-bottom:2px solid #2a2a3e;position:sticky;top:0;z-index:2;font-weight:600;text-transform:uppercase;font-size:11px;letter-spacing:.5px}}
td{{padding:10px 8px;border-bottom:1px solid #1e1e2e}}
tbody tr:hover{{background:#16213e}}
.record-row{{cursor:pointer;transition:background .15s}}
.title-cell{{max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
.highlight{{color:#4ADE80;font-weight:700}}
.bar-row{{display:flex;align-items:center;margin-bottom:8px}}
.bar-label{{width:180px;font-size:13px;color:#aaa;flex-shrink:0}}
.bar-container{{flex:1;background:#1a1a2e;border-radius:4px;height:26px}}
.bar{{background:linear-gradient(90deg,#4A90D9,#7B61FF);height:100%;border-radius:4px;min-width:30px;font-size:12px;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600}}
.card{{background:#1a1a2e;border:1px solid #2a2a3e;border-radius:10px;padding:20px;margin-bottom:16px}}
.tag{{display:inline-block;background:#2a2a3e;color:#4A90D9;padding:3px 10px;border-radius:12px;font-size:12px;margin:2px}}
.match-item{{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #2a2a3e}}
.match-item:last-child{{border-bottom:none}}
.match-score{{font-size:22px;font-weight:700;color:#4ADE80;min-width:50px;text-align:right}}
.match-company{{font-weight:600;font-size:14px;margin-bottom:3px}}
.match-rationale{{font-size:12px;color:#888;line-height:1.4}}
.detail-panel{{background:#16213e;border:1px solid #4A90D9;border-radius:10px;padding:28px;margin-top:20px;display:none;animation:fadeIn .2s ease}}
.detail-panel.open{{display:block}}
@keyframes fadeIn{{from{{opacity:0;transform:translateY(8px)}}to{{opacity:1;transform:translateY(0)}}}}
.detail-grid{{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px}}
@media(max-width:768px){{.detail-grid{{grid-template-columns:1fr}}.content{{padding:16px}}.header{{padding:20px 16px}}.nav{{padding:0 16px}}.bar-label{{width:120px}}}}
.close-btn{{float:right;background:none;border:1px solid #4A90D9;color:#4A90D9;padding:6px 18px;border-radius:6px;cursor:pointer;font-size:13px;transition:all .2s}}
.close-btn:hover{{background:#4A90D9;color:#fff}}
.dim-bar{{display:flex;align-items:center;margin-bottom:6px}}
.dim-name{{width:150px;font-size:12px;color:#aaa;flex-shrink:0}}
.dim-track{{flex:1;background:#0f1117;border-radius:3px;height:20px;position:relative}}
.dim-fill{{height:20px;border-radius:3px;min-width:4px;display:flex;align-items:center;justify-content:flex-end;padding-right:6px;font-size:11px;color:#fff;font-weight:600}}
.metric-grid{{display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:center}}
.metric-big{{font-size:28px;font-weight:700}}
.metric-label{{font-size:11px;color:#888;margin-top:2px;text-transform:uppercase}}
.heatmap-label{{font-size:13px;padding:10px 12px;font-weight:500}}
.heatmap-cell{{text-align:center;padding:10px 12px;font-weight:600;font-size:14px}}
.domain-chart{{margin-bottom:30px}}
</style>
</head>
<body>

<div class="header">
    <h1>AI-Powered University IP Accelerator</h1>
    <p>Discovery &rarr; Scoring &rarr; AI Acceleration &rarr; Corporate Matchmaking &nbsp;|&nbsp; {total} IP Records Processed</p>
</div>

<div class="nav">
    <button class="nav-btn active" onclick="showPage('overview',this)">Overview</button>
    <button class="nav-btn" onclick="showPage('heatmap',this)">AI Acceleration Heatmap</button>
</div>

<div class="content">

<!-- ===== OVERVIEW PAGE ===== -->
<div class="page active" id="page-overview">

    <div class="metrics">
        <div class="stat-card"><div class="stat-value">{total}</div><div class="stat-label">Total Records</div></div>
        <div class="stat-card"><div class="stat-value">{avg_composite:.2f}</div><div class="stat-label">Avg Composite Score</div></div>
        <div class="stat-card"><div class="stat-value">{avg_adjusted:.1f}</div><div class="stat-label">Avg Adjusted Score</div></div>
        {source_cards}
    </div>

    <div class="section domain-chart">
        <h2>Records by Domain</h2>
        {domain_bars}
    </div>

    <div class="section">
        <h2>Top 20 IP Records <span style="font-size:13px;color:#8899aa;font-weight:400">(click any row for details)</span></h2>
        <div style="overflow-x:auto">
        <table>
            <thead>
            <tr>
                <th>#</th><th>Title</th><th>Institution</th><th>Source</th>
                <th>Composite</th><th>Domain</th><th>Multiplier</th><th>Adjusted</th>
                <th>Top Corp Match</th><th>Match Score</th>
            </tr>
            </thead>
            <tbody id="records-tbody"></tbody>
        </table>
        </div>
    </div>

    <div class="detail-panel" id="detail-panel">
        <button class="close-btn" onclick="closeDetail()">Close &times;</button>
        <h2 id="detail-title" style="margin-right:80px"></h2>
        <p style="color:#8899aa;margin:8px 0" id="detail-meta"></p>
        <p style="margin:12px 0;line-height:1.6;font-size:14px;color:#ccc" id="detail-abstract"></p>

        <div class="detail-grid">
            <div>
                <h3>10-Dimension Scores</h3>
                <div id="detail-dims"></div>
            </div>
            <div>
                <h3>Key Metrics</h3>
                <div class="card" id="detail-metrics"></div>
                <h3 style="margin-top:16px">AI Acceleration Rationale</h3>
                <div class="card" id="detail-rationale" style="font-size:13px;color:#aaa;line-height:1.6"></div>
            </div>
        </div>

        <h3 style="margin-top:20px">Top 5 Corporate Matches</h3>
        <div class="card" id="detail-matches"></div>
    </div>

</div>

<!-- ===== HEATMAP PAGE ===== -->
<div class="page" id="page-heatmap">
    <h2>AI-Science Acceleration Heatmap</h2>
    <p style="color:#8899aa;margin-bottom:20px">How much AI is compressing R&D timelines across 15 technology domains</p>
    <div style="overflow-x:auto">
    <table id="heatmap-table">
        <thead>
        <tr>
            <th style="width:200px">Domain</th>
            <th>Compression Factor (1-10x)</th>
            <th>AI Maturity (0-1)</th>
            <th>Acceleration Trend (0.5-2x)</th>
            <th>Combined Impact</th>
        </tr>
        </thead>
        <tbody id="heatmap-tbody"></tbody>
    </table>
    </div>
</div>

</div>

<script>
// Embed data directly
var RECORDS = {records_json};
var HEATMAP = {heatmap_json};

var dimColors = {{
    'technical_novelty':'#4A90D9','defensibility':'#7B61FF','market_size':'#4ADE80',
    'trl':'#F59E0B','competitive_landscape':'#EF4444','citation_momentum':'#8B5CF6',
    'inventor_quality':'#EC4899','fto_risk':'#14B8A6','patent_life':'#F97316',
    'licensing_complexity':'#06B6D4'
}};

// Navigation
function showPage(name, btn) {{
    document.querySelectorAll('.page').forEach(function(p) {{ p.classList.remove('active'); }});
    document.querySelectorAll('.nav-btn').forEach(function(b) {{ b.classList.remove('active'); }});
    document.getElementById('page-' + name).classList.add('active');
    btn.classList.add('active');
}}

// Build records table
(function() {{
    var tbody = document.getElementById('records-tbody');
    var html = '';
    for (var i = 0; i < RECORDS.length && i < 20; i++) {{
        var r = RECORDS[i];
        var matches = r.corporate_matches || [];
        var topMatch = matches.length > 0 ? matches[0].company : 'N/A';
        var topScore = matches.length > 0 ? matches[0].match_score.toFixed(0) : '-';
        var domain = (r.acceleration_domain || 'general').replace(/_/g, ' ');
        domain = domain.replace(/\\b\\w/g, function(c) {{ return c.toUpperCase(); }});
        var title = r.title || '';
        if (title.length > 70) title = title.substring(0, 67) + '...';
        var inst = r.institution || '';
        if (inst.length > 28) inst = inst.substring(0, 25) + '...';

        html += '<tr class="record-row" data-idx="' + i + '">' +
            '<td>' + (i + 1) + '</td>' +
            '<td class="title-cell">' + title + '</td>' +
            '<td>' + inst + '</td>' +
            '<td>' + (r.source || '').toUpperCase() + '</td>' +
            '<td><strong>' + (r.composite_score || 0).toFixed(2) + '</strong></td>' +
            '<td>' + domain + '</td>' +
            '<td>' + (r.acceleration_multiplier || 1).toFixed(2) + 'x</td>' +
            '<td class="highlight">' + (r.adjusted_composite_score || 0).toFixed(2) + '</td>' +
            '<td>' + topMatch + '</td>' +
            '<td>' + topScore + '</td>' +
            '</tr>';
    }}
    tbody.innerHTML = html;

    // Click handlers
    tbody.querySelectorAll('.record-row').forEach(function(row) {{
        row.addEventListener('click', function() {{
            var idx = parseInt(this.dataset.idx);
            showDetail(idx);
        }});
    }});
}})();

var activeRow = -1;

function showDetail(idx) {{
    var r = RECORDS[idx];
    var panel = document.getElementById('detail-panel');
    panel.classList.add('open');

    // Highlight active row
    document.querySelectorAll('.record-row').forEach(function(row) {{
        row.style.background = parseInt(row.dataset.idx) === idx ? '#1e2a42' : '';
    }});

    document.getElementById('detail-title').textContent = r.title;
    document.getElementById('detail-meta').innerHTML =
        '<span class="tag">' + (r.source || '').toUpperCase() + '</span> ' +
        '<span class="tag">' + (r.institution || '') + '</span> ' +
        '<span class="tag">' + (r.date || '') + '</span>';
    document.getElementById('detail-abstract').textContent = r.abstract || '';

    // Dimension scores
    var dims = r.dimension_scores || {{}};
    var dh = '';
    for (var name in dims) {{
        var val = dims[name];
        var pct = (val / 10) * 100;
        var color = dimColors[name] || '#4A90D9';
        var label = name.replace(/_/g, ' ').replace(/\\b\\w/g, function(c) {{ return c.toUpperCase(); }});
        dh += '<div class="dim-bar"><span class="dim-name">' + label +
            '</span><div class="dim-track"><div class="dim-fill" style="width:' + pct +
            '%;background:' + color + '">' + val.toFixed(1) + '</div></div></div>';
    }}
    document.getElementById('detail-dims').innerHTML = dh;

    // Key metrics
    var domain = (r.acceleration_domain || 'general').replace(/_/g, ' ');
    domain = domain.replace(/\\b\\w/g, function(c) {{ return c.toUpperCase(); }});
    document.getElementById('detail-metrics').innerHTML =
        '<div class="metric-grid">' +
        '<div><div class="metric-big" style="color:#4A90D9">' + (r.composite_score || 0).toFixed(2) + '</div><div class="metric-label">Composite</div></div>' +
        '<div><div class="metric-big" style="color:#4ADE80">' + (r.adjusted_composite_score || 0).toFixed(2) + '</div><div class="metric-label">Adjusted</div></div>' +
        '<div><div class="metric-big" style="color:#F59E0B">' + (r.acceleration_multiplier || 1).toFixed(2) + 'x</div><div class="metric-label">Multiplier</div></div>' +
        '<div><div class="metric-big" style="color:#8B5CF6">' + domain + '</div><div class="metric-label">Domain</div></div></div>';

    document.getElementById('detail-rationale').textContent = r.acceleration_rationale || '';

    // Corporate matches
    var matches = (r.corporate_matches || []).slice(0, 5);
    var mh = '';
    for (var i = 0; i < matches.length; i++) {{
        var m = matches[i];
        mh += '<div class="match-item"><div><div class="match-company">#' + (i + 1) + ' ' + m.company +
            '</div><div class="match-rationale">' + (m.rationale || '') +
            '</div></div><div class="match-score">' + m.match_score.toFixed(0) + '</div></div>';
    }}
    document.getElementById('detail-matches').innerHTML = mh;

    panel.scrollIntoView({{ behavior: 'smooth', block: 'start' }});
}}

function closeDetail() {{
    document.getElementById('detail-panel').classList.remove('open');
    document.querySelectorAll('.record-row').forEach(function(row) {{ row.style.background = ''; }});
}}

// Build heatmap
(function() {{
    var tbody = document.getElementById('heatmap-tbody');
    var html = '';
    for (var i = 0; i < HEATMAP.length; i++) {{
        var h = HEATMAP[i];
        html += '<tr>' +
            '<td class="heatmap-label">' + h.domain + '</td>' +
            '<td class="heatmap-cell" style="' + heatColor(h.compression, 10) + '">' + h.compression + '</td>' +
            '<td class="heatmap-cell" style="' + heatColor(h.maturity, 1.0) + '">' + h.maturity + '</td>' +
            '<td class="heatmap-cell" style="' + heatColor(h.trend, 2.0) + '">' + h.trend + '</td>' +
            '<td class="heatmap-cell" style="' + heatColor(h.combined, 12) + '">' + h.combined + '</td>' +
            '</tr>';
    }}
    tbody.innerHTML = html;
}})();

function heatColor(val, maxVal) {{
    var intensity = maxVal > 0 ? val / maxVal : 0;
    var r = Math.round(40 + 215 * intensity);
    var g = Math.round(80 * (1 - intensity) + 40);
    var b = Math.round(50 * (1 - intensity) + 30);
    var textColor = intensity > 0.35 ? '#fff' : '#aaa';
    return 'background:rgb(' + r + ',' + g + ',' + b + ');color:' + textColor;
}}
</script>
</body>
</html>"""

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        f.write(html)

    print(f"Dashboard saved to: {OUTPUT_PATH}")
    print(f"Open in browser: file://{OUTPUT_PATH}")


if __name__ == "__main__":
    main()
