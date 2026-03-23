"use client";

import { useState, useEffect } from "react";
import {
  getAgentRuns,
  getReviewQueue,
  updateReviewItem,
  type AgentRun,
  type ReviewQueueItem,
} from "@/lib/ops-mock-data";

const STATUS_STYLES: Record<string, { dot: string; badge: string; label: string }> = {
  running: { dot: "bg-green-400 animate-pulse", badge: "bg-green-500/10 text-green-400 border-green-500/20", label: "Running" },
  idle: { dot: "bg-gray-500", badge: "bg-gray-800 text-gray-400 border-gray-700", label: "Idle" },
  error: { dot: "bg-red-400 animate-pulse", badge: "bg-red-500/10 text-red-400 border-red-500/20", label: "Error" },
};

const TYPE_COLORS: Record<string, string> = {
  linkedin_post: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  outreach_email: "bg-green-500/15 text-green-400 border-green-500/20",
  knowledge_entry: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  sample_brief: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  market_intel: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentRun[]>([]);
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  useEffect(() => {
    setAgents(getAgentRuns());
    setQueue(getReviewQueue());
  }, []);

  function handleReviewAction(id: string, action: "approved" | "rejected") {
    updateReviewItem(id, { status: action });
    setQueue(getReviewQueue());
  }

  const pendingItems = queue.filter((q) => q.status === "pending");

  return (
    <div className="space-y-6">
      {/* Agent Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Agents</p>
          <p className="text-2xl font-bold text-white mt-1">{agents.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Currently Running</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{agents.filter((a) => a.status === "running").length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Items Processed</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{agents.reduce((s, a) => s + a.itemsProcessed, 0)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{pendingItems.length}</p>
        </div>
      </div>

      {/* Agent Cards */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Agent Orchestration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const style = STATUS_STYLES[agent.status];
            const isExpanded = expandedAgent === agent.id;
            return (
              <div
                key={agent.id}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                      <h3 className="text-sm font-semibold text-white">{agent.agentName}</h3>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase">Last Run</p>
                      <p className="text-xs text-gray-400 font-medium">{timeAgo(agent.lastRunTime)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase">Processed</p>
                      <p className="text-xs text-white font-medium">{agent.itemsProcessed}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase">Pending</p>
                      <p className={`text-xs font-medium ${agent.itemsPendingReview > 0 ? "text-yellow-400" : "text-gray-500"}`}>
                        {agent.itemsPendingReview}
                      </p>
                    </div>
                  </div>

                  {/* System Prompt Preview */}
                  <p className="text-[10px] text-gray-600 leading-relaxed line-clamp-2 mb-3">
                    {agent.systemPromptPreview}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                      Run Now
                    </button>
                    <button
                      onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {isExpanded ? "Hide" : "History"}
                    </button>
                  </div>
                </div>

                {/* Run History */}
                {isExpanded && (
                  <div className="border-t border-gray-800 px-4 py-3">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Last 5 Runs</p>
                    <div className="space-y-1.5">
                      {agent.runHistory.map((run, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{formatDateTime(run.timestamp)}</span>
                          <span className="text-gray-400">{run.itemsProcessed} items</span>
                          <span className={run.status === "success" ? "text-green-400" : "text-red-400"}>
                            {run.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Queue */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Review Queue</h2>
          <span className="text-xs text-gray-500">{pendingItems.length} items pending</span>
        </div>
        <div className="space-y-2">
          {pendingItems.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-sm text-gray-600">
              All items reviewed. Queue is empty.
            </div>
          ) : (
            pendingItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${TYPE_COLORS[item.type] || "bg-gray-800 text-gray-400 border-gray-700"}`}>
                        {item.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-gray-600">{item.targetPlatform}</span>
                      <span className="text-[10px] text-gray-700">{timeAgo(item.timestamp)}</span>
                    </div>
                    <h3 className="text-sm font-medium text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{item.contentPreview}</p>
                    <p className="text-[10px] text-gray-700 mt-1">Source: {item.agentSource}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReviewAction(item.id, "approved")}
                      className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReviewAction(item.id, "rejected")}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                    <button className="bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
