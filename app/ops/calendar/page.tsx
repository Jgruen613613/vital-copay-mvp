"use client";

import { useState, useEffect } from "react";
import {
  getMilestones,
  getCurrentDay,
  type ExecutionMilestone,
} from "@/lib/ops-mock-data";

const PHASES = [
  { num: 1 as const, label: "Foundation & First Revenue", days: [1, 21], color: "blue" },
  { num: 2 as const, label: "Compounding Engine", days: [22, 55], color: "green" },
  { num: 3 as const, label: "The Push to $1M", days: [56, 90], color: "purple" },
];

const COLOR_MAP: Record<string, { bg: string; bar: string; text: string; border: string; dot: string; light: string }> = {
  blue: { bg: "bg-blue-500/10", bar: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/20", dot: "bg-blue-500", light: "bg-blue-500/5" },
  green: { bg: "bg-green-500/10", bar: "bg-green-500", text: "text-green-400", border: "border-green-500/20", dot: "bg-green-500", light: "bg-green-500/5" },
  purple: { bg: "bg-purple-500/10", bar: "bg-purple-500", text: "text-purple-400", border: "border-purple-500/20", dot: "bg-purple-500", light: "bg-purple-500/5" },
};

const STATUS_STYLES: Record<string, { badge: string; label: string }> = {
  completed: { badge: "bg-green-500/10 text-green-400 border-green-500/20", label: "Completed" },
  in_progress: { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "In Progress" },
  pending: { badge: "bg-gray-800 text-gray-500 border-gray-700", label: "Pending" },
  blocked: { badge: "bg-red-500/10 text-red-400 border-red-500/20", label: "Blocked" },
};

export default function CalendarPage() {
  const [milestones, setMilestones] = useState<ExecutionMilestone[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const currentDay = getCurrentDay();

  useEffect(() => {
    setMilestones(getMilestones());
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">90-Day Execution Calendar</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Day {currentDay} of 90 — {Math.max(0, 90 - currentDay)} days remaining
            </p>
          </div>
          <div className="flex items-center gap-1">
            {/* Mini progress for entire 90 days */}
            <div className="w-48 h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${Math.min((currentDay / 90) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 ml-2">{Math.round((currentDay / 90) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Timeline visualization — day markers */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="relative h-12">
            {/* Track */}
            <div className="absolute top-5 left-0 right-0 h-1.5 bg-gray-800 rounded-full" />
            {/* Phase segments */}
            {PHASES.map((phase) => {
              const left = ((phase.days[0] - 1) / 90) * 100;
              const width = ((phase.days[1] - phase.days[0] + 1) / 90) * 100;
              const c = COLOR_MAP[phase.color];
              return (
                <div
                  key={phase.num}
                  className={`absolute top-5 h-1.5 ${c.bar} rounded-full opacity-30`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              );
            })}
            {/* Current day indicator */}
            <div
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${Math.min(((currentDay - 1) / 90) * 100, 100)}%`, transform: "translateX(-50%)" }}
            >
              <div className="w-3 h-3 bg-white rounded-full border-2 border-blue-400 shadow-lg shadow-blue-500/30" />
              <div className="w-0.5 h-4 bg-blue-400" />
              <span className="text-[10px] text-blue-400 font-mono font-bold">D{currentDay}</span>
            </div>
            {/* Phase labels */}
            {PHASES.map((phase) => {
              const center = ((phase.days[0] - 1 + phase.days[1]) / 2 / 90) * 100;
              const c = COLOR_MAP[phase.color];
              return (
                <div
                  key={`label-${phase.num}`}
                  className="absolute top-8 text-[10px] font-medium"
                  style={{ left: `${center}%`, transform: "translateX(-50%)" }}
                >
                  <span className={c.text}>P{phase.num}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phase Sections */}
      {PHASES.map((phase) => {
        const phaseMilestones = milestones.filter((m) => m.phase === phase.num);
        const completed = phaseMilestones.filter((m) => m.status === "completed").length;
        const pct = phaseMilestones.length > 0 ? Math.round((completed / phaseMilestones.length) * 100) : 0;
        const c = COLOR_MAP[phase.color];
        const isCurrentPhase = currentDay >= phase.days[0] && currentDay <= phase.days[1];

        return (
          <div key={phase.num} className={`bg-gray-900 border rounded-xl overflow-hidden ${isCurrentPhase ? c.border + " border" : "border-gray-800"}`}>
            {/* Phase Header */}
            <div className={`p-4 ${isCurrentPhase ? c.light : ""}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${c.bg} ${c.text} border ${c.border}`}>
                    Phase {phase.num}
                  </span>
                  <h3 className="text-sm font-semibold text-white">{phase.label}</h3>
                  {isCurrentPhase && (
                    <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full font-medium">
                      CURRENT
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Days {phase.days[0]}-{phase.days[1]}</span>
                  <span className="text-xs text-gray-500">{completed}/{phaseMilestones.length} done</span>
                  <span className={`text-sm font-mono font-bold ${c.text}`}>{pct}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mt-3">
                <div className={`h-full ${c.bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Milestones */}
            <div className="border-t border-gray-800">
              {phaseMilestones.map((milestone) => {
                const status = STATUS_STYLES[milestone.status];
                const isExpanded = expandedId === milestone.id;
                const isPast = currentDay > milestone.targetDay;
                const isOverdue = isPast && milestone.status !== "completed";

                return (
                  <div
                    key={milestone.id}
                    className="border-b border-gray-800/50 last:border-b-0"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : milestone.id)}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-800/20 transition-colors"
                    >
                      {/* Status icon */}
                      <div className="shrink-0">
                        {milestone.status === "completed" ? (
                          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : milestone.status === "in_progress" ? (
                          <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                          </div>
                        ) : milestone.status === "blocked" ? (
                          <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                            <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-800 border border-gray-700" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${milestone.status === "completed" ? "text-gray-400 line-through" : "text-white"}`}>
                            {milestone.title}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">
                              OVERDUE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Day target */}
                      <div className="shrink-0 text-right">
                        <span className="text-xs text-gray-500 font-mono">Day {milestone.targetDay}</span>
                        {milestone.completedDay && (
                          <span className="text-[10px] text-green-500 block">Done D{milestone.completedDay}</span>
                        )}
                      </div>

                      {/* Status badge */}
                      <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${status.badge}`}>
                        {status.label}
                      </span>

                      {/* Chevron */}
                      <svg
                        className={`w-4 h-4 text-gray-600 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pl-12">
                        <p className="text-sm text-gray-400 mb-3">{milestone.description}</p>
                        <div className="grid grid-cols-2 gap-4 bg-gray-800/30 rounded-lg p-3">
                          <div>
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider">Target Metric</p>
                            <p className="text-sm text-white font-medium mt-0.5">{milestone.targetMetric}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider">Actual Metric</p>
                            <p className={`text-sm font-medium mt-0.5 ${
                              milestone.actualMetric === "\u2014" ? "text-gray-600" :
                              milestone.status === "completed" ? "text-green-400" : "text-yellow-400"
                            }`}>
                              {milestone.actualMetric}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
