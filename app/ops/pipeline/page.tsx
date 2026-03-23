"use client";

import { useState, useEffect, useMemo } from "react";
import { getProspects, type Prospect } from "@/lib/ops-mock-data";

const STAGES: { key: Prospect["stage"]; label: string }[] = [
  { key: "identified", label: "Identified" },
  { key: "sample_sent", label: "Sample Sent" },
  { key: "responded", label: "Responded" },
  { key: "meeting_booked", label: "Meeting Booked" },
  { key: "proposal_sent", label: "Proposal Sent" },
  { key: "closed_won", label: "Closed Won" },
  { key: "closed_lost", label: "Closed Lost" },
];

function intentColor(score: number): string {
  if (score >= 8) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (score >= 5) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
}

function formatMoney(n: number): string {
  return `$${n.toLocaleString()}`;
}

export default function PipelinePage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [intentMin, setIntentMin] = useState(1);
  const [intentMax, setIntentMax] = useState(10);

  useEffect(() => {
    setProspects(getProspects());
  }, []);

  const verticals = useMemo(() => Array.from(new Set(prospects.map((p) => p.vertical))).sort(), [prospects]);
  const agents = useMemo(() => Array.from(new Set(prospects.map((p) => p.sourceAgent))).sort(), [prospects]);

  const filtered = useMemo(() => {
    return prospects.filter((p) => {
      if (verticalFilter !== "all" && p.vertical !== verticalFilter) return false;
      if (agentFilter !== "all" && p.sourceAgent !== agentFilter) return false;
      if (p.switchingIntentScore < intentMin || p.switchingIntentScore > intentMax) return false;
      return true;
    });
  }, [prospects, verticalFilter, agentFilter, intentMin, intentMax]);

  const activeProspects = filtered.filter((p) => !["closed_won", "closed_lost"].includes(p.stage));
  const wonProspects = filtered.filter((p) => p.stage === "closed_won");
  const totalProspects = filtered.length;
  const conversionRate = totalProspects > 0 ? ((wonProspects.length / totalProspects) * 100).toFixed(0) : "0";
  const avgDeal = activeProspects.length > 0
    ? Math.round(activeProspects.reduce((s, p) => s + p.estimatedMonthlySpend, 0) / activeProspects.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Prospects</p>
          <p className="text-2xl font-bold text-white mt-1">{totalProspects}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Conversion Rate</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{conversionRate}%</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Monthly Deal</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{formatMoney(avgDeal)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Pipeline Value</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">
            {formatMoney(activeProspects.reduce((s, p) => s + p.estimatedMonthlySpend * 12, 0))}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Vertical</label>
            <select
              value={verticalFilter}
              onChange={(e) => setVerticalFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Verticals</option>
              {verticals.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Source Agent</label>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Agents</option>
              {agents.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Intent Score</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={10}
                value={intentMin}
                onChange={(e) => setIntentMin(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-2 py-1.5 w-14 focus:outline-none focus:border-blue-500"
              />
              <span className="text-gray-600">to</span>
              <input
                type="number"
                min={1}
                max={10}
                value={intentMax}
                onChange={(e) => setIntentMax(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-2 py-1.5 w-14 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STAGES.map((stage) => {
            const stageProspects = filtered.filter((p) => p.stage === stage.key);
            const isWon = stage.key === "closed_won";
            const isLost = stage.key === "closed_lost";
            return (
              <div
                key={stage.key}
                className="w-72 flex-shrink-0"
              >
                <div className={`flex items-center justify-between mb-3 px-1 ${
                  isWon ? "text-green-400" : isLost ? "text-red-400" : "text-gray-400"
                }`}>
                  <h3 className="text-sm font-semibold">{stage.label}</h3>
                  <span className="text-xs bg-gray-800 rounded-full px-2 py-0.5 text-gray-500">
                    {stageProspects.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {stageProspects.map((prospect) => (
                    <div
                      key={prospect.id}
                      className="bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-white leading-tight">{prospect.companyName}</h4>
                        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border ${intentColor(prospect.switchingIntentScore)}`}>
                          {prospect.switchingIntentScore}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{prospect.contactName} · {prospect.contactTitle}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">{prospect.vertical}</span>
                        <span className="text-[10px] text-gray-600">{prospect.sourceAgent}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-blue-400 font-medium">{formatMoney(prospect.estimatedMonthlySpend)}/mo</span>
                        {prospect.daysInStage > 0 && (
                          <span className="text-gray-600">{prospect.daysInStage}d in stage</span>
                        )}
                      </div>
                      {prospect.notes && (
                        <p className="text-[10px] text-gray-600 mt-2 leading-relaxed line-clamp-2">{prospect.notes}</p>
                      )}
                    </div>
                  ))}
                  {stageProspects.length === 0 && (
                    <div className="border border-dashed border-gray-800 rounded-xl p-4 text-center text-xs text-gray-700">
                      No prospects
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
