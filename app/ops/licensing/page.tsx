"use client";

import { useState, useEffect, useMemo } from "react";
import { getLicensingProspects, type LicensingProspect } from "@/lib/ops-mock-data";

const TIERS = {
  operator: { label: "Operator", price: "$8,500", cap: 30, color: "blue" },
  builder: { label: "Builder", price: "$22,500", cap: 15, color: "purple" },
  partner: { label: "Partner", price: "$45,000", cap: 5, color: "yellow" },
} as const;

const FUNNEL_STAGES: { key: LicensingProspect["stage"]; label: string }[] = [
  { key: "identified", label: "Identified" },
  { key: "outreach_sent", label: "Outreach Sent" },
  { key: "replied", label: "Replied" },
  { key: "demo_booked", label: "Demo Booked" },
  { key: "demo_completed", label: "Demo Completed" },
  { key: "proposal_sent", label: "Proposal Sent" },
  { key: "negotiating", label: "Negotiating" },
  { key: "closed_won", label: "Closed Won" },
  { key: "closed_lost", label: "Closed Lost" },
];

const TIER_BADGE: Record<string, string> = {
  operator: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  builder: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  partner: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
};

function formatMoney(n: number): string {
  return `$${n.toLocaleString()}`;
}

function formatFollowers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return n.toString();
}

export default function LicensingPage() {
  const [prospects, setProspects] = useState<LicensingProspect[]>([]);

  useEffect(() => {
    setProspects(getLicensingProspects());
  }, []);

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = { operator: 0, builder: 0, partner: 0 };
    prospects.filter((p) => p.stage === "closed_won").forEach((p) => counts[p.tierInterest]++);
    return counts;
  }, [prospects]);

  const activePipeline = prospects.filter((p) => !["closed_won", "closed_lost"].includes(p.stage));
  const totalPipelineValue = activePipeline.reduce((s, p) => s + p.dealValue, 0);
  const projectedClose = activePipeline
    .filter((p) => ["demo_completed", "proposal_sent", "negotiating"].includes(p.stage))
    .reduce((s, p) => s + p.dealValue, 0);

  const upcomingDemos = prospects
    .filter((p) => p.demoDate && new Date(p.demoDate) > new Date("2026-03-23"))
    .sort((a, b) => new Date(a.demoDate!).getTime() - new Date(b.demoDate!).getTime());

  return (
    <div className="space-y-6">
      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["operator", "builder", "partner"] as const).map((tier) => {
          const info = TIERS[tier];
          const filled = tierCounts[tier];
          const pct = (filled / info.cap) * 100;
          const colorMap = {
            blue: { bar: "bg-blue-500", border: "border-blue-500/20", text: "text-blue-400" },
            purple: { bar: "bg-purple-500", border: "border-purple-500/20", text: "text-purple-400" },
            yellow: { bar: "bg-yellow-500", border: "border-yellow-500/20", text: "text-yellow-400" },
          };
          const colors = colorMap[info.color];
          return (
            <div key={tier} className={`bg-gray-900 border border-gray-800 rounded-xl p-4 ${colors.border}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-semibold ${colors.text}`}>{info.label}</h3>
                <span className="text-lg font-bold text-white">{info.price}</span>
              </div>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <span className="text-3xl font-bold text-white">{filled}</span>
                  <span className="text-sm text-gray-500"> / {info.cap} cap</span>
                </div>
                <span className="text-xs text-gray-500">{info.cap - filled} remaining</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${colors.bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Pipeline</p>
          <p className="text-2xl font-bold text-white mt-1">{formatMoney(totalPipelineValue)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Projected Close</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{formatMoney(projectedClose)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 col-span-2 lg:col-span-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Active Prospects</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{activePipeline.length}</p>
        </div>
      </div>

      {/* Pipeline Funnel */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-white mb-4">Pipeline Funnel</h2>
        <div className="space-y-2">
          {FUNNEL_STAGES.map((stage) => {
            const count = prospects.filter((p) => p.stage === stage.key).length;
            const maxCount = Math.max(...FUNNEL_STAGES.map((s) => prospects.filter((p) => p.stage === s.key).length), 1);
            const pct = (count / maxCount) * 100;
            const isTerminal = stage.key === "closed_won" || stage.key === "closed_lost";
            const barColor = stage.key === "closed_won" ? "bg-green-500" : stage.key === "closed_lost" ? "bg-red-500" : "bg-blue-500";
            return (
              <div key={stage.key} className="flex items-center gap-3">
                <span className={`text-xs w-28 shrink-0 text-right ${isTerminal ? (stage.key === "closed_won" ? "text-green-400" : "text-red-400") : "text-gray-400"}`}>
                  {stage.label}
                </span>
                <div className="flex-1 h-6 bg-gray-800 rounded overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded transition-all flex items-center px-2`}
                    style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                  >
                    {count > 0 && <span className="text-[10px] font-bold text-white">{count}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prospect List */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">All Licensing Prospects</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-2.5 text-xs text-gray-500 font-medium uppercase">Name</th>
                <th className="px-4 py-2.5 text-xs text-gray-500 font-medium uppercase">Company</th>
                <th className="px-4 py-2.5 text-xs text-gray-500 font-medium uppercase">Followers</th>
                <th className="px-4 py-2.5 text-xs text-gray-500 font-medium uppercase">Tier</th>
                <th className="px-4 py-2.5 text-xs text-gray-500 font-medium uppercase">Stage</th>
                <th className="px-4 py-2.5 text-xs text-gray-500 font-medium uppercase">Deal Value</th>
                <th className="px-4 py-2.5 text-xs text-gray-500 font-medium uppercase">Next Action</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => (
                <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{p.name}</div>
                    <div className="text-[10px] text-gray-600">{p.title}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{p.company}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono">{formatFollowers(p.followers)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${TIER_BADGE[p.tierInterest]}`}>
                      {TIERS[p.tierInterest].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400">{p.stage.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-4 py-3 text-white font-mono">{formatMoney(p.dealValue)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">{p.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Demos */}
      {upcomingDemos.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Upcoming Demos</h2>
          <div className="space-y-2">
            {upcomingDemos.map((p) => (
              <div key={p.id} className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-3">
                <div className="text-center bg-blue-500/10 rounded-lg px-3 py-1.5 border border-blue-500/20">
                  <p className="text-xs text-blue-400 font-medium">
                    {new Date(p.demoDate!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                  <p className="text-[10px] text-blue-300">
                    {new Date(p.demoDate!).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.company} — {TIERS[p.tierInterest].label} ({formatMoney(p.dealValue)})</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${TIER_BADGE[p.tierInterest]}`}>
                  {TIERS[p.tierInterest].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
