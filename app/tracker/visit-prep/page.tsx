"use client";

import { useState } from "react";

export default function VisitPrepPage() {
  const [showPrint, setShowPrint] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/tracker/dashboard" className="text-sm text-[#2563eb] hover:underline">← Back to Tracker</a>
          <button
            onClick={() => window.print()}
            className="bg-[#1a365d] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2a4a7f]"
          >
            Print / Save PDF
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 print:py-4">
        {/* Header */}
        <div className="border-b-2 border-[#1a365d] pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1a365d]">Provider Visit Prep</h1>
              <p className="text-gray-500 text-sm">Prepared by VITAL Symptom Tracker</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Visit Date</p>
              <p className="font-bold text-[#1a365d]">April 2, 2026</p>
              <p className="text-sm text-gray-600">Dr. Rebecca Chen</p>
            </div>
          </div>
        </div>

        {/* Patient Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 print:bg-white print:border print:border-gray-300">
          <h2 className="font-bold text-[#1a365d] mb-2">Patient Summary</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-500">Condition:</span> Rheumatoid Arthritis</div>
            <div><span className="text-gray-500">Diagnosed:</span> 2022</div>
            <div><span className="text-gray-500">Current Meds:</span> Humira 40mg biweekly, Methotrexate 20mg weekly</div>
            <div><span className="text-gray-500">Report Period:</span> Last 90 days</div>
          </div>
        </div>

        {/* Symptom Trend Summary */}
        <section className="mb-6">
          <h2 className="font-bold text-[#1a365d] text-lg mb-3 border-b border-gray-200 pb-2">90-Day Symptom Trend</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Avg Pain Score", value: "4.8/10", trend: "↑ from 3.2", color: "text-red-600" },
              { label: "Avg Stiffness", value: "42 min", trend: "↑ from 18 min", color: "text-red-600" },
              { label: "Med Adherence", value: "89%", trend: "↓ from 95%", color: "text-yellow-600" },
              { label: "Avg Fatigue", value: "5.1/10", trend: "↑ from 3.4", color: "text-red-600" },
            ].map(({ label, value, trend, color }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-lg p-3 print:border-gray-300">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-bold text-[#1a365d]">{value}</p>
                <p className={`text-xs ${color}`}>{trend}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Flare Pattern Analysis */}
        <section className="mb-6">
          <h2 className="font-bold text-[#1a365d] text-lg mb-3 border-b border-gray-200 pb-2">Flare Pattern Analysis</h2>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 print:bg-white">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong className="text-red-700">Active flare detected (Days 20-26):</strong> Patient experienced a significant
              symptom escalation over a 7-day period. Pain scores increased from an average of 3.2 to 6.4.
              Morning stiffness duration tripled from ~18 minutes to ~72 minutes. Joint involvement expanded
              from 2-3 joints (hands, wrists) to 5-7 joints (adding knees, elbows, shoulders).
            </p>
            <p className="text-sm text-gray-700 mt-2">
              The flare appears to correlate with two missed doses of Humira in the preceding 10 days and a
              reported high-stress period. Symptoms began improving around Day 27 following reported dose adherence resumption.
            </p>
          </div>
        </section>

        {/* Medication Adherence */}
        <section className="mb-6">
          <h2 className="font-bold text-[#1a365d] text-lg mb-3 border-b border-gray-200 pb-2">Medication Adherence Record</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
              <div>
                <p className="font-medium text-[#1a365d]">Humira (adalimumab) 40mg</p>
                <p className="text-xs text-gray-500">Biweekly subcutaneous injection</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#1a365d]">85%</p>
                <p className="text-xs text-yellow-600">2 missed doses in 90 days</p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
              <div>
                <p className="font-medium text-[#1a365d]">Methotrexate 20mg</p>
                <p className="text-xs text-gray-500">Weekly oral</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600">93%</p>
                <p className="text-xs text-gray-500">1 missed dose in 90 days</p>
              </div>
            </div>
          </div>
        </section>

        {/* Lab Trends */}
        <section className="mb-6">
          <h2 className="font-bold text-[#1a365d] text-lg mb-3 border-b border-gray-200 pb-2">Lab Trends</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 pr-4">Test</th>
                  <th className="pb-2 pr-4">Jan 15</th>
                  <th className="pb-2 pr-4">Feb 1</th>
                  <th className="pb-2 pr-4">Mar 1</th>
                  <th className="pb-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-medium text-[#1a365d]">CRP (mg/L)</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2 pr-4">0.8</td>
                  <td className="py-2 pr-4 text-red-600 font-medium">1.2 ⚠</td>
                  <td className="py-2 text-red-600">↑ Rising</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-medium text-[#1a365d]">ESR (mm/hr)</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2 pr-4 text-red-600 font-medium">28 ⚠</td>
                  <td className="py-2 text-gray-500">New test</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-[#1a365d]">RF (IU/mL)</td>
                  <td className="py-2 pr-4 text-red-600">45 ⚠</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2 text-gray-500">Stable</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Recommended Questions */}
        <section className="mb-6">
          <h2 className="font-bold text-[#1a365d] text-lg mb-3 border-b border-gray-200 pb-2">Recommended Discussion Points</h2>
          <div className="space-y-3">
            {[
              { q: "The recent flare: should we adjust Humira dosing or consider adding a medication?", priority: "high", context: "Pain scores reached 8/10 during the flare. Current Humira dose may be subtherapeutic." },
              { q: "CRP is trending up (0.8 → 1.2). Should we repeat labs today?", priority: "high", context: "CRP increase correlates with the clinical flare. ESR also elevated at 28." },
              { q: "Two missed Humira doses preceded the flare. Can we discuss strategies for adherence?", priority: "medium", context: "Patient reported the misses were due to supply/timing issues, not intentional." },
              { q: "Morning stiffness has been lasting 60-90 minutes on flare days. Is this consistent with disease activity vs mechanical?", priority: "medium", context: "Stiffness pattern is inflammatory (improves with activity) not mechanical." },
              { q: "Should we consider the methotrexate dose increase (15mg → 20mg from February) as contributing to or addressing the flare?", priority: "medium", context: "The dose was increased 5 weeks ago. Therapeutic effect typically seen at 4-8 weeks." },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 print:break-inside-avoid">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${item.priority === "high" ? "bg-red-500" : "bg-yellow-500"}`} />
                  <div>
                    <p className="font-medium text-[#1a365d] text-sm">{item.q}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.context}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
          <p>Prepared with VITAL Symptom Tracker · AI-assisted analysis by Claude</p>
          <p>This summary is for informational purposes only and does not constitute medical advice.</p>
          <p className="mt-2">Generated {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
