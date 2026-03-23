"use client";

import { useState, useEffect } from "react";

// Joint positions for the body map SVG (front-facing, simplified)
const JOINTS = [
  { id: "neck", label: "Neck", cx: 150, cy: 65 },
  { id: "jaw", label: "Jaw", cx: 150, cy: 45 },
  { id: "left_shoulder", label: "L Shoulder", cx: 110, cy: 95 },
  { id: "right_shoulder", label: "R Shoulder", cx: 190, cy: 95 },
  { id: "left_elbow", label: "L Elbow", cx: 85, cy: 145 },
  { id: "right_elbow", label: "R Elbow", cx: 215, cy: 145 },
  { id: "left_wrist", label: "L Wrist", cx: 70, cy: 190 },
  { id: "right_wrist", label: "R Wrist", cx: 230, cy: 190 },
  { id: "left_hand", label: "L Hand", cx: 60, cy: 215 },
  { id: "right_hand", label: "R Hand", cx: 240, cy: 215 },
  { id: "left_hip", label: "L Hip", cx: 125, cy: 215 },
  { id: "right_hip", label: "R Hip", cx: 175, cy: 215 },
  { id: "left_knee", label: "L Knee", cx: 125, cy: 290 },
  { id: "right_knee", label: "R Knee", cx: 175, cy: 290 },
  { id: "left_ankle", label: "L Ankle", cx: 120, cy: 360 },
  { id: "right_ankle", label: "R Ankle", cx: 180, cy: 360 },
  { id: "left_foot", label: "L Foot", cx: 115, cy: 385 },
  { id: "right_foot", label: "R Foot", cx: 185, cy: 385 },
];

const TABS = ["Today", "Trends", "Labs", "Visits", "Timeline"] as const;
type Tab = typeof TABS[number];

const STIFFNESS_OPTIONS = [0, 5, 10, 15, 30, 45, 60, 90, 120];

const LAB_TYPES = ["CRP", "ESR", "RF", "Anti-CCP", "ANA", "CBC", "Metabolic Panel", "Liver Function", "Kidney Function"];

interface LogEntry {
  log_date: string;
  pain_score: number;
  morning_stiffness_minutes: number;
  affected_joints: string[];
  fatigue_score: number;
  sleep_quality: number;
  stress_level: number;
  skin_involvement: boolean;
  medication_taken: boolean;
  free_text: string | null;
}

export default function TrackerDashboard() {
  const [tab, setTab] = useState<Tab>("Today");
  const [logs, setLogs] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [trendRange, setTrendRange] = useState<7 | 30 | 90>(7);

  // Today's form state
  const [affectedJoints, setAffectedJoints] = useState<string[]>([]);
  const [painScore, setPainScore] = useState(5);
  const [stiffness, setStiffness] = useState(15);
  const [fatigue, setFatigue] = useState(4);
  const [sleepQuality, setSleepQuality] = useState(6);
  const [stressLevel, setStressLevel] = useState(3);
  const [skinInvolvement, setSkinInvolvement] = useState(false);
  const [medTaken, setMedTaken] = useState(true);
  const [freeText, setFreeText] = useState("");
  const [saved, setSaved] = useState(false);

  // Modals
  const [showLabModal, setShowLabModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [newLab, setNewLab] = useState({ lab_type: "CRP", value: "", unit: "mg/L", reference_range: "", lab_date: new Date().toISOString().split("T")[0] });
  const [newVisit, setNewVisit] = useState({ visit_date: "", provider_name: "", visit_type: "rheumatology", notes: "" });

  useEffect(() => {
    fetch("/api/tracker?type=logs&days=90").then(r => r.json()).then(setLogs).catch(() => {});
    fetch("/api/tracker?type=labs").then(r => r.json()).then(setLabs).catch(() => {});
    fetch("/api/tracker?type=visits").then(r => r.json()).then(setVisits).catch(() => {});
    fetch("/api/tracker?type=analyses").then(r => r.json()).then(setAnalyses).catch(() => {});
  }, []);

  const streakDays = (() => {
    let count = 0;
    const today = new Date().toISOString().split("T")[0];
    const sorted = [...logs].sort((a, b) => b.log_date.localeCompare(a.log_date));
    for (const log of sorted) {
      const expected = new Date();
      expected.setDate(expected.getDate() - count);
      if (log.log_date === expected.toISOString().split("T")[0]) count++;
      else break;
    }
    return count;
  })();

  const trendLogs = logs.slice(-trendRange);

  function toggleJoint(id: string) {
    setAffectedJoints(prev =>
      prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]
    );
  }

  async function saveLog() {
    await fetch("/api/tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "log",
        data: {
          pain_score: painScore,
          morning_stiffness_minutes: stiffness,
          affected_joints: affectedJoints,
          fatigue_score: fatigue,
          sleep_quality: sleepQuality,
          stress_level: stressLevel,
          skin_involvement: skinInvolvement,
          medication_taken: medTaken,
          free_text: freeText || null,
        },
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const painEmoji = painScore <= 2 ? "😊" : painScore <= 4 ? "🙂" : painScore <= 6 ? "😐" : painScore <= 8 ? "😣" : "😫";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/tracker" className="text-lg font-bold text-[#1a365d]">VITAL Tracker</a>
          <span className="text-sm text-gray-500">{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
        </div>
      </nav>

      {/* Tab bar */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 flex overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t ? "border-[#2563eb] text-[#2563eb]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* TODAY TAB */}
        {tab === "Today" && (
          <div className="space-y-6">
            {/* Streak */}
            <div className="text-center">
              <span className="text-2xl font-bold text-[#1a365d]">Day {streakDays}</span>
              {streakDays >= 7 && <span className="ml-2 text-xl">🔥</span>}
            </div>

            {/* Joint Body Map */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <h3 className="font-medium text-[#1a365d] mb-2 text-sm">Tap affected joints</h3>
              <div className="flex justify-center">
                <svg viewBox="0 0 300 400" className="w-64 h-80">
                  {/* Body outline */}
                  <ellipse cx="150" cy="25" rx="22" ry="25" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
                  <line x1="150" y1="50" x2="150" y2="210" stroke="#d1d5db" strokeWidth="1.5" />
                  <line x1="150" y1="90" x2="80" y2="190" stroke="#d1d5db" strokeWidth="1.5" />
                  <line x1="150" y1="90" x2="220" y2="190" stroke="#d1d5db" strokeWidth="1.5" />
                  <line x1="150" y1="210" x2="120" y2="380" stroke="#d1d5db" strokeWidth="1.5" />
                  <line x1="150" y1="210" x2="180" y2="380" stroke="#d1d5db" strokeWidth="1.5" />
                  {/* Joint circles */}
                  {JOINTS.map(joint => (
                    <g key={joint.id} onClick={() => toggleJoint(joint.id)} className="cursor-pointer">
                      <circle
                        cx={joint.cx} cy={joint.cy} r={10}
                        fill={affectedJoints.includes(joint.id) ? "#ef4444" : "#e5e7eb"}
                        stroke={affectedJoints.includes(joint.id) ? "#dc2626" : "#9ca3af"}
                        strokeWidth="1.5"
                        className="transition-colors"
                      />
                      <text x={joint.cx} y={joint.cy + 22} textAnchor="middle" className="text-[8px] fill-gray-400">
                        {joint.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">{affectedJoints.length} joint{affectedJoints.length !== 1 ? "s" : ""} selected</p>
            </div>

            {/* Pain Score */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-[#1a365d] text-sm">Pain Score</h3>
                <span className="text-2xl">{painEmoji}</span>
              </div>
              <input
                type="range" min="0" max="10" value={painScore}
                onChange={e => setPainScore(parseInt(e.target.value))}
                className="w-full accent-[#2563eb]"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0 — None</span>
                <span className="font-bold text-[#1a365d] text-lg">{painScore}</span>
                <span>10 — Worst</span>
              </div>
            </div>

            {/* Morning Stiffness */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <h3 className="font-medium text-[#1a365d] text-sm mb-2">Morning Stiffness Duration</h3>
              <div className="flex flex-wrap gap-2">
                {STIFFNESS_OPTIONS.map(min => (
                  <button
                    key={min}
                    onClick={() => setStiffness(min)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      stiffness === min ? "bg-[#2563eb] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {min === 0 ? "None" : min >= 120 ? "120+ min" : `${min} min`}
                  </button>
                ))}
              </div>
            </div>

            {/* Fatigue / Sleep / Stress sliders */}
            {[
              { label: "Fatigue", value: fatigue, setter: setFatigue, low: "None", high: "Extreme" },
              { label: "Sleep Quality", value: sleepQuality, setter: setSleepQuality, low: "Terrible", high: "Excellent" },
              { label: "Stress Level", value: stressLevel, setter: setStressLevel, low: "None", high: "Extreme" },
            ].map(({ label, value, setter, low, high }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-[#1a365d] text-sm">{label}</h3>
                  <span className="font-bold text-[#1a365d]">{value}/10</span>
                </div>
                <input
                  type="range" min="0" max="10" value={value}
                  onChange={e => setter(parseInt(e.target.value))}
                  className="w-full accent-[#2563eb]"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{low}</span><span>{high}</span>
                </div>
              </div>
            ))}

            {/* Toggles */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#1a365d]">Skin involvement today?</span>
                <button
                  onClick={() => setSkinInvolvement(!skinInvolvement)}
                  className={`w-12 h-6 rounded-full transition-colors ${skinInvolvement ? "bg-[#2563eb]" : "bg-gray-300"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${skinInvolvement ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#1a365d]">Medication taken?</span>
                <button
                  onClick={() => setMedTaken(!medTaken)}
                  className={`w-12 h-6 rounded-full transition-colors ${medTaken ? "bg-emerald-500" : "bg-gray-300"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${medTaken ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>

            {/* Free text */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <h3 className="font-medium text-[#1a365d] text-sm mb-2">Anything else today?</h3>
              <textarea
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
                placeholder="How are you feeling? Any notable events?"
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>

            {/* Save */}
            <button
              onClick={saveLog}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-colors ${
                saved ? "bg-emerald-500 text-white" : "bg-[#1a365d] hover:bg-[#2a4a7f] text-white"
              }`}
            >
              {saved ? "✓ Saved!" : "Save Today's Log"}
            </button>
          </div>
        )}

        {/* TRENDS TAB */}
        {tab === "Trends" && (
          <div className="space-y-6">
            <div className="flex justify-center gap-2">
              {([7, 30, 90] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setTrendRange(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    trendRange === d ? "bg-[#2563eb] text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {d} days
                </button>
              ))}
            </div>

            {/* Pain Score Chart (simple SVG) */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <h3 className="font-medium text-[#1a365d] text-sm mb-3">Pain Score Trend</h3>
              <svg viewBox="0 0 400 120" className="w-full">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(y => (
                  <line key={y} x1="30" y1={y + 10} x2="390" y2={y + 10} stroke="#f3f4f6" strokeWidth="1" />
                ))}
                {/* Y-axis labels */}
                <text x="5" y="15" className="text-[10px] fill-gray-400">10</text>
                <text x="10" y="65" className="text-[10px] fill-gray-400">5</text>
                <text x="10" y="115" className="text-[10px] fill-gray-400">0</text>
                {/* Data line */}
                {trendLogs.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    points={trendLogs.map((log, i) => {
                      const x = 30 + (i / (trendLogs.length - 1)) * 360;
                      const y = 110 - (log.pain_score / 10) * 100;
                      return `${x},${y}`;
                    }).join(" ")}
                  />
                )}
                {/* Data points */}
                {trendLogs.map((log, i) => {
                  const x = 30 + (trendLogs.length > 1 ? (i / (trendLogs.length - 1)) * 360 : 180);
                  const y = 110 - (log.pain_score / 10) * 100;
                  return <circle key={i} cx={x} cy={y} r="3" fill="#2563eb" />;
                })}
              </svg>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-7">
                <span>{trendLogs[0]?.log_date}</span>
                <span>{trendLogs[trendLogs.length - 1]?.log_date}</span>
              </div>
            </div>

            {/* Stiffness Bar Chart */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <h3 className="font-medium text-[#1a365d] text-sm mb-3">Morning Stiffness (minutes)</h3>
              <div className="flex items-end gap-1 h-24">
                {trendLogs.map((log, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-purple-400 rounded-t-sm min-w-[3px]"
                    style={{ height: `${Math.min(100, (log.morning_stiffness_minutes / 120) * 100)}%` }}
                    title={`${log.log_date}: ${log.morning_stiffness_minutes}min`}
                  />
                ))}
              </div>
            </div>

            {/* Medication Adherence */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <h3 className="font-medium text-[#1a365d] text-sm mb-2">Medication Adherence</h3>
              {(() => {
                const taken = trendLogs.filter(l => l.medication_taken).length;
                const pct = trendLogs.length ? Math.round((taken / trendLogs.length) * 100) : 0;
                return (
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-bold text-[#1a365d]">{pct}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{taken} of {trendLogs.length} days</p>
                  </div>
                );
              })()}
            </div>

            {/* Joint Heatmap */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <h3 className="font-medium text-[#1a365d] text-sm mb-2">Most Affected Joints</h3>
              {(() => {
                const counts: Record<string, number> = {};
                trendLogs.forEach(log => {
                  (log.affected_joints || []).forEach((j: string) => { counts[j] = (counts[j] || 0) + 1; });
                });
                const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 6);
                const max = sorted[0]?.[1] || 1;
                return (
                  <div className="space-y-2">
                    {sorted.map(([joint, count]) => (
                      <div key={joint} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-24 truncate">{JOINTS.find(j => j.id === joint)?.label || joint}</span>
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-400 rounded-full"
                            style={{ width: `${(count / max) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{count}d</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* AI Analysis */}
            {analyses[0] && (
              <div className="rounded-2xl p-5 border-2 border-transparent bg-gradient-to-r from-purple-50 to-blue-50" style={{ borderImage: "linear-gradient(135deg, #8b5cf6, #3b82f6) 1" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-purple-700">AI Analysis</span>
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Claude</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {analyses[0].summary_text}
                </p>
                {analyses[0].recommendations && (
                  <div className="mt-3 space-y-2">
                    {analyses[0].recommendations.map((rec: any, i: number) => (
                      <div key={i} className={`flex items-start gap-2 text-sm ${rec.priority === "high" || rec.priority === "urgent" ? "text-red-700" : "text-gray-600"}`}>
                        <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${rec.priority === "urgent" ? "bg-red-500" : rec.priority === "high" ? "bg-orange-500" : "bg-blue-500"}`} />
                        {rec.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Conversion prompt */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <p className="text-sm text-emerald-800">
                Tracking <strong>Humira</strong>? Our pharmacy program brings the annual cost to <strong>$0</strong>.{" "}
                <a href="/zero-copay" className="underline font-medium">Check if you qualify →</a>
              </p>
            </div>
          </div>
        )}

        {/* LABS TAB */}
        {tab === "Labs" && (
          <div className="space-y-4">
            <button
              onClick={() => setShowLabModal(true)}
              className="w-full bg-[#1a365d] text-white font-medium py-3 rounded-xl hover:bg-[#2a4a7f] transition-colors"
            >
              + Add Lab Result
            </button>

            {labs.map((lab: any) => (
              <div key={lab.id} className="bg-white rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-[#1a365d]">{lab.lab_type}</span>
                    <span className="text-gray-500 text-sm ml-2">{lab.lab_date}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    lab.is_abnormal ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {lab.is_abnormal ? "Abnormal" : "Normal"}
                  </span>
                </div>
                <p className="text-lg font-bold text-[#1a365d]">
                  {lab.value} <span className="text-sm font-normal text-gray-500">{lab.unit}</span>
                </p>
                <p className="text-xs text-gray-400">Ref: {lab.reference_range}</p>
                {lab.claude_explanation && (
                  <div className="mt-3 bg-blue-50 rounded-xl p-3">
                    <p className="text-xs font-medium text-blue-700 mb-1">What this means:</p>
                    <p className="text-sm text-gray-700">{lab.claude_explanation}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Lab Modal */}
            {showLabModal && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center">
                <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-[#1a365d] text-lg">Add Lab Result</h3>
                  <select
                    value={newLab.lab_type}
                    onChange={e => setNewLab({ ...newLab, lab_type: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3"
                  >
                    {LAB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    type="text" placeholder="Value" value={newLab.value}
                    onChange={e => setNewLab({ ...newLab, value: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3"
                  />
                  <input
                    type="date" value={newLab.lab_date}
                    onChange={e => setNewLab({ ...newLab, lab_date: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setShowLabModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium">Cancel</button>
                    <button
                      onClick={async () => {
                        await fetch("/api/tracker", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ type: "lab", data: newLab }),
                        });
                        setShowLabModal(false);
                        fetch("/api/tracker?type=labs").then(r => r.json()).then(setLabs);
                      }}
                      className="flex-1 bg-[#1a365d] text-white py-3 rounded-xl font-medium"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VISITS TAB */}
        {tab === "Visits" && (
          <div className="space-y-4">
            <button
              onClick={() => setShowVisitModal(true)}
              className="w-full bg-[#1a365d] text-white font-medium py-3 rounded-xl hover:bg-[#2a4a7f] transition-colors"
            >
              + Add Visit
            </button>

            {/* Upcoming */}
            {visits.filter((v: any) => new Date(v.visit_date) > new Date()).map((visit: any) => (
              <div key={visit.id} className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full font-medium">Upcoming</span>
                  <span className="text-sm text-gray-500">{visit.visit_date}</span>
                </div>
                <h4 className="font-bold text-[#1a365d]">{visit.provider_name}</h4>
                <p className="text-sm text-gray-600 capitalize">{visit.visit_type}</p>
                <p className="text-xs text-blue-600 mt-2">
                  {Math.ceil((new Date(visit.visit_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days away
                </p>
                <a href="/tracker/visit-prep" className="inline-block mt-3 bg-[#2563eb] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                  Generate Visit Prep →
                </a>
              </div>
            ))}

            {/* Past */}
            {visits.filter((v: any) => new Date(v.visit_date) <= new Date()).map((visit: any) => (
              <div key={visit.id} className="bg-white rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Past Visit</span>
                  <span className="text-sm text-gray-500">{visit.visit_date}</span>
                </div>
                <h4 className="font-bold text-[#1a365d]">{visit.provider_name}</h4>
                {visit.notes && <p className="text-sm text-gray-600 mt-1">{visit.notes}</p>}
                {visit.medication_changes && (
                  <p className="text-sm text-orange-600 mt-1">Rx change: {visit.medication_changes}</p>
                )}
                {visit.next_steps && <p className="text-sm text-blue-600 mt-1">Next: {visit.next_steps}</p>}
              </div>
            ))}

            {/* Visit Modal */}
            {showVisitModal && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center">
                <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-[#1a365d] text-lg">Add Visit</h3>
                  <input type="date" value={newVisit.visit_date} onChange={e => setNewVisit({ ...newVisit, visit_date: e.target.value })} className="w-full border rounded-xl px-4 py-3" />
                  <input type="text" placeholder="Provider name" value={newVisit.provider_name} onChange={e => setNewVisit({ ...newVisit, provider_name: e.target.value })} className="w-full border rounded-xl px-4 py-3" />
                  <select value={newVisit.visit_type} onChange={e => setNewVisit({ ...newVisit, visit_type: e.target.value })} className="w-full border rounded-xl px-4 py-3">
                    <option value="rheumatology">Rheumatology</option>
                    <option value="primary_care">Primary Care</option>
                    <option value="wound_care">Wound Care</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea placeholder="Notes" value={newVisit.notes} onChange={e => setNewVisit({ ...newVisit, notes: e.target.value })} className="w-full border rounded-xl px-4 py-3 h-24 resize-none" />
                  <div className="flex gap-3">
                    <button onClick={() => setShowVisitModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium">Cancel</button>
                    <button
                      onClick={async () => {
                        await fetch("/api/tracker", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ type: "visit", data: newVisit }),
                        });
                        setShowVisitModal(false);
                        fetch("/api/tracker?type=visits").then(r => r.json()).then(setVisits);
                      }}
                      className="flex-1 bg-[#1a365d] text-white py-3 rounded-xl font-medium"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TIMELINE TAB */}
        {tab === "Timeline" && (
          <div className="space-y-1">
            <h3 className="font-bold text-[#1a365d] mb-4">Your Health Timeline</h3>
            {[...logs].reverse().slice(0, 14).map((log: any, i: number) => {
              const isFlare = log.pain_score >= 6;
              const isGood = log.pain_score <= 3;
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${isFlare ? "bg-red-500" : isGood ? "bg-emerald-500" : "bg-yellow-400"}`} />
                    {i < 13 && <div className="w-0.5 flex-1 bg-gray-200" />}
                  </div>
                  <div className={`flex-1 rounded-xl p-3 mb-2 ${isFlare ? "bg-red-50 border border-red-200" : isGood ? "bg-emerald-50 border border-emerald-200" : "bg-white border border-gray-200"}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{log.log_date}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isFlare ? "bg-red-100 text-red-700" : isGood ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
                        Pain: {log.pain_score}/10
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Stiffness: {log.morning_stiffness_minutes}min · Fatigue: {log.fatigue_score}/10 · {log.affected_joints?.length || 0} joints
                    </div>
                    {log.free_text && (
                      <p className="text-sm text-gray-700 mt-1 italic">&ldquo;{log.free_text}&rdquo;</p>
                    )}
                    {!log.medication_taken && (
                      <span className="text-xs text-red-500 mt-1 inline-block">⚠ Medication missed</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Interleave lab results */}
            {labs.slice(0, 3).map((lab: any) => (
              <div key={`lab-${lab.id}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full mt-1.5 bg-blue-500" />
                  <div className="w-0.5 flex-1 bg-gray-200" />
                </div>
                <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{lab.lab_date}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Lab</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{lab.lab_type}: {lab.value} {lab.unit} {lab.is_abnormal ? "⚠" : "✓"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
