"use client";

import { useState, useEffect } from "react";
import {
  getDashboardStats,
  getRevenueEntries,
  getAgentRuns,
  getReviewQueue,
  getMilestones,
  getCurrentDay,
  type DashboardStats,
  type RevenueEntry,
  type AgentRun,
  type ReviewQueueItem,
  type ExecutionMilestone,
} from "@/lib/ops-mock-data";

function formatCurrency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n.toLocaleString()}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const STATUS_DOT: Record<string, string> = {
  running: "bg-green-400 animate-pulse",
  idle: "bg-gray-500",
  error: "bg-red-400 animate-pulse",
};

export default function OpsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueEntry[]>([]);
  const [agents, setAgents] = useState<AgentRun[]>([]);
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [milestones, setMilestones] = useState<ExecutionMilestone[]>([]);

  useEffect(() => {
    setStats(getDashboardStats());
    setRevenue(getRevenueEntries());
    setAgents(getAgentRuns());
    setQueue(getReviewQueue());
    setMilestones(getMilestones());
  }, []);

  if (!stats) return null;

  const maxRevenue = Math.max(...revenue.map((r) => r.amount), 1);
  const pendingItems = queue.filter((q) => q.status === "pending");
  const approvedToday = queue.filter((q) => q.status === "approved").length;
  const rejectedToday = queue.filter((q) => q.status === "rejected").length;

  const phases = [
    { num: 1, label: "Foundation & First Revenue", color: "blue", days: "1-21" },
    { num: 2, label: "Compounding Engine", color: "green", days: "22-55" },
    { num: 3, label: "The Push to $1M", color: "purple", days: "56-90" },
  ];

  const currentDay = getCurrentDay();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), sub: "All time", color: "text-green-400" },
          { label: "Active Clients", value: stats.activeClients.toString(), sub: `${formatCurrency(stats.totalRevenue - 3000)} MRR`, color: "text-blue-400" },
          { label: "Pipeline Value", value: formatCurrency(stats.pipelineValue), sub: `${12 - stats.activeClients} prospects`, color: "text-yellow-400" },
          { label: "Licensing Pipeline", value: formatCurrency(stats.licensingPipelineValue), sub: "8 prospects", color: "text-purple-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{kpi.label}</p>
            <p className={`text-2xl lg:text-3xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Agent Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Revenue — Last 30 Days</h2>
            <span className="text-xs text-gray-500">
              Total: {formatCurrency(revenue.reduce((s, r) => s + r.amount, 0))}
            </span>
          </div>
          <div className="flex items-end gap-[2px] h-40">
            {revenue.map((entry, i) => {
              const h = Math.max((entry.amount / maxRevenue) * 100, 2);
              const barColor =
                entry.source === "consulting"
                  ? "bg-blue-500"
                  : entry.source === "licensing"
                  ? "bg-purple-500"
                  : "bg-green-500";
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col justify-end group relative"
                >
                  <div
                    className={`${barColor} rounded-t-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                    style={{ height: `${h}%` }}
                  />
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-xs text-white px-2 py-1 rounded whitespace-nowrap z-10">
                    {entry.date}: ${entry.amount.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Consulting</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Licensing</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500" /> Retainer</span>
          </div>
        </div>

        {/* Agent Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Agent Status</h2>
          <div className="space-y-3">
            {agents.slice(0, 6).map((agent) => (
              <div key={agent.id} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[agent.status]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{agent.agentName}</p>
                  <p className="text-xs text-gray-500">{timeAgo(agent.lastRunTime)} · {agent.itemsProcessed} processed</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  agent.status === "running" ? "bg-green-500/10 text-green-400" :
                  agent.status === "error" ? "bg-red-500/10 text-red-400" :
                  "bg-gray-800 text-gray-500"
                }`}>
                  {agent.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Queue + Phase Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Review Queue */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Review Queue</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-yellow-400">{pendingItems.length} pending</span>
              <span className="text-green-400">{approvedToday} approved</span>
              <span className="text-red-400">{rejectedToday} rejected</span>
            </div>
          </div>
          <div className="space-y-2">
            {pendingItems.slice(0, 4).map((item) => {
              const typeColors: Record<string, string> = {
                linkedin_post: "bg-blue-500/10 text-blue-400",
                outreach_email: "bg-green-500/10 text-green-400",
                knowledge_entry: "bg-purple-500/10 text-purple-400",
                sample_brief: "bg-yellow-500/10 text-yellow-400",
                market_intel: "bg-cyan-500/10 text-cyan-400",
              };
              return (
                <div key={item.id} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${typeColors[item.type] || "bg-gray-700 text-gray-400"}`}>
                      {item.type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-gray-600">{item.agentSource}</span>
                  </div>
                  <p className="text-sm text-white truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{item.contentPreview}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase Progress */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Phase Progress</h2>
            <span className="text-xs text-gray-500">Day {currentDay} of 90</span>
          </div>
          <div className="space-y-5">
            {phases.map((phase) => {
              const phaseMilestones = milestones.filter((m) => m.phase === phase.num);
              const completed = phaseMilestones.filter((m) => m.status === "completed").length;
              const pct = phaseMilestones.length > 0 ? Math.round((completed / phaseMilestones.length) * 100) : 0;
              const colorMap: Record<string, { bar: string; text: string }> = {
                blue: { bar: "bg-blue-500", text: "text-blue-400" },
                green: { bar: "bg-green-500", text: "text-green-400" },
                purple: { bar: "bg-purple-500", text: "text-purple-400" },
              };
              const colors = colorMap[phase.color];
              return (
                <div key={phase.num}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className={`text-sm font-medium ${colors.text}`}>Phase {phase.num}</span>
                      <span className="text-xs text-gray-500 ml-2">{phase.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-white">{pct}%</span>
                      <span className="text-xs text-gray-600 ml-1.5">Days {phase.days}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.bar} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">{completed}/{phaseMilestones.length} milestones</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Run GTM Scan", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", color: "bg-blue-500 hover:bg-blue-600" },
            { label: "Generate Daily Brief", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "bg-green-500 hover:bg-green-600" },
            { label: "Queue LinkedIn Post", icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z", color: "bg-purple-500 hover:bg-purple-600" },
          ].map((action) => (
            <button
              key={action.label}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${action.color}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
              </svg>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
