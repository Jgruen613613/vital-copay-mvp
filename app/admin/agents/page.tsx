"use client";

import { useState, useEffect } from "react";

type View = "dashboard" | "community" | "ads" | "tracker" | "transfers" | "outreach" | "content" | "queue";

const AGENT_ICONS: Record<string, string> = {
  community_monitor: "👁",
  ad_optimizer: "📊",
  tracker_analysis: "🧠",
  transfer_communications: "📱",
  rheumatologist_outreach: "🏥",
  content_producer: "✍️",
};

const SCHEDULE_LABELS: Record<string, string> = {
  every_2h: "Every 2 hours",
  daily: "Daily",
  realtime: "Real-time",
  weekly: "Weekly",
  "3x_weekly": "3x/week",
};

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AgentDashboard() {
  const [view, setView] = useState<View>("dashboard");
  const [agents, setAgents] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [contentQueue, setContentQueue] = useState<any[]>([]);
  const [recentRuns, setRecentRuns] = useState<any[]>([]);
  const [expandedContent, setExpandedContent] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/agents?type=agents").then(r => r.json()).then(setAgents).catch(() => {});
    fetch("/api/agents?type=metrics").then(r => r.json()).then(setMetrics).catch(() => {});
    fetch("/api/agents?type=content").then(r => r.json()).then(setContentQueue).catch(() => {});
    fetch("/api/agents?type=runs").then(r => r.json()).then(setRecentRuns).catch(() => {});
  }, []);

  async function handleContentAction(id: number, action: string) {
    await fetch("/api/agents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_id: id, action }),
    });
    setContentQueue(prev => prev.map(c => c.id === id ? { ...c, status: action === "approve" ? "approved" : "rejected" } : c));
  }

  const pendingCount = contentQueue.filter(c => c.status === "pending_review").length;

  const NAV_ITEMS: { key: View; label: string; icon: string; badge?: number }[] = [
    { key: "dashboard", label: "Dashboard", icon: "📋" },
    { key: "community", label: "Community", icon: "👁", badge: contentQueue.filter(c => c.agent_id === 1 && c.status === "pending_review").length },
    { key: "ads", label: "Ad Optimizer", icon: "📊", badge: contentQueue.filter(c => c.agent_id === 2 && c.status === "pending_review").length },
    { key: "tracker", label: "Tracker AI", icon: "🧠", badge: contentQueue.filter(c => c.agent_id === 3 && c.status === "pending_review").length },
    { key: "transfers", label: "Transfers", icon: "📱", badge: 1 },
    { key: "outreach", label: "Outreach", icon: "🏥", badge: contentQueue.filter(c => c.agent_id === 5 && c.status === "pending_review").length },
    { key: "content", label: "Content", icon: "✍️", badge: contentQueue.filter(c => c.agent_id === 6 && c.status === "pending_review").length },
    { key: "queue", label: "All Queue", icon: "📥", badge: pendingCount },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1a2332] text-white transform transition-transform lg:translate-x-0 lg:static lg:flex-shrink-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-lg font-bold">VITAL Agent Hub</h1>
          <p className="text-xs text-gray-400 mt-1">Acquisition Engine Control</p>
        </div>
        <nav className="p-2 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => { setView(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                view === item.key ? "bg-[#2563eb] text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{item.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <a href="/" className="text-xs text-gray-400 hover:text-white">← Back to Main Site</a>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1a2332] text-white h-14 flex items-center px-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-bold">Agent Hub</span>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 lg:ml-0 pt-14 lg:pt-0">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">

          {/* DASHBOARD VIEW */}
          {view === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#1a365d]">Agent Dashboard</h2>

              {/* Agent Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent: any) => (
                  <div key={agent.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{AGENT_ICONS[agent.agent_type] || "🤖"}</span>
                        <h3 className="font-bold text-[#1a365d] text-sm">{agent.agent_name}</h3>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full ${agent.is_active ? (agent.last_run_status === "success" ? "bg-emerald-500" : "bg-yellow-500") : "bg-gray-400"}`} />
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Schedule</span>
                        <span className="text-gray-700">{SCHEDULE_LABELS[agent.schedule] || agent.schedule}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last run</span>
                        <span className="text-gray-700">{timeAgo(agent.last_run_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total processed</span>
                        <span className="font-mono text-gray-700">{agent.total_items_processed?.toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{agent.last_run_summary}</p>
                    <button className="mt-3 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                      Run Now
                    </button>
                  </div>
                ))}
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Qualified Leads (Month)", value: metrics.qualified_leads_this_month || 127, color: "text-emerald-600" },
                  { label: "Transfers This Week", value: metrics.transfer_initiations_this_week || 23, color: "text-blue-600" },
                  { label: "Posts Flagged Today", value: metrics.community_posts_flagged_today || 8, color: "text-orange-600" },
                  { label: "Pending Review", value: pendingCount, color: "text-red-600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Content Queue Preview */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-[#1a365d]">Content Review Queue</h3>
                  <button onClick={() => setView("queue")} className="text-xs text-[#2563eb] hover:underline">View All →</button>
                </div>
                <div className="divide-y divide-gray-100">
                  {contentQueue.filter(c => c.status === "pending_review").slice(0, 5).map((item: any) => (
                    <div key={item.id} className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`w-2 h-2 rounded-full ${item.priority === "urgent" ? "bg-red-500" : item.priority === "high" ? "bg-orange-500" : "bg-blue-500"}`} />
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.content_type.replace("_", " ")}</span>
                        <span className="text-sm font-medium text-[#1a365d] flex-1 truncate">{item.title}</span>
                        <span className="text-xs text-gray-400">{timeAgo(item.created_at)}</span>
                      </div>
                      {expandedContent === item.id ? (
                        <div className="ml-5 mt-2">
                          <p className="text-sm text-gray-600 whitespace-pre-line mb-3">{item.content}</p>
                          <div className="flex gap-2">
                            <button onClick={() => handleContentAction(item.id, "approve")} className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-600">Approve</button>
                            <button onClick={() => handleContentAction(item.id, "reject")} className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600">Reject</button>
                            <button onClick={() => setExpandedContent(null)} className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg">Collapse</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setExpandedContent(item.id)} className="ml-5 text-xs text-[#2563eb] hover:underline">
                          Review →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-[#1a365d]">Recent Activity</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {recentRuns.map((run: any) => (
                    <div key={run.id} className="px-4 py-3 flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${run.status === "success" ? "bg-emerald-500" : run.status === "failed" ? "bg-red-500" : "bg-yellow-500"}`} />
                      <span className="text-sm text-gray-700 flex-1">{run.summary || `${run.agent_name} completed`}</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(run.started_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* COMMUNITY MONITOR VIEW */}
          {view === "community" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#1a365d]">Community Monitor</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Scanned Today</p><p className="text-2xl font-bold font-mono text-[#1a365d]">247</p></div>
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Flagged</p><p className="text-2xl font-bold font-mono text-orange-600">8</p></div>
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Responses Drafted</p><p className="text-2xl font-bold font-mono text-blue-600">5</p></div>
              </div>
              {contentQueue.filter(c => c.agent_id === 1).map(item => (
                <div key={item.id} className={`bg-white rounded-xl border p-4 ${item.status === "pending_review" ? "border-orange-200" : "border-gray-200"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.metadata?.urgency === "critical" ? "bg-red-100 text-red-700" :
                      item.metadata?.urgency === "high" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"
                    }`}>{item.metadata?.urgency || "medium"}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{item.metadata?.platform}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === "approved" ? "bg-emerald-100 text-emerald-700" : item.status === "rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{item.status.replace("_", " ")}</span>
                  </div>
                  <h4 className="font-medium text-[#1a365d] text-sm">{item.title}</h4>
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{item.content}</p>
                  {item.status === "pending_review" && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleContentAction(item.id, "approve")} className="bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg">Approve & Post</button>
                      <button className="bg-blue-500 text-white text-xs px-4 py-2 rounded-lg">Edit</button>
                      <button onClick={() => handleContentAction(item.id, "reject")} className="bg-gray-200 text-gray-700 text-xs px-4 py-2 rounded-lg">Skip</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* AD OPTIMIZER VIEW */}
          {view === "ads" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#1a365d]">Ad Campaign Optimizer</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Total Spend (Month)</p><p className="text-2xl font-bold font-mono text-[#1a365d]">$4,800</p></div>
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Avg CPL</p><p className="text-2xl font-bold font-mono text-emerald-600">$14.20</p></div>
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Total Leads</p><p className="text-2xl font-bold font-mono text-blue-600">338</p></div>
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Conversion Rate</p><p className="text-2xl font-bold font-mono text-purple-600">3.2%</p></div>
              </div>
              {[
                { name: "RA Copay Relief", platform: "Meta", spend: "$2,100", leads: 170, cpl: "$12.35", status: "active" },
                { name: "Tracker Awareness", platform: "Meta", spend: "$980", leads: 44, cpl: "$22.27", status: "active" },
                { name: "Retargeting — Visitors", platform: "Meta", spend: "$1,200", leads: 98, cpl: "$12.24", status: "active" },
                { name: "Lookalike — Patient List", platform: "Google", spend: "$520", leads: 26, cpl: "$20.00", status: "paused" },
              ].map((campaign, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-[#1a365d] text-sm">{campaign.name}</h4>
                      <span className="text-xs text-gray-500">{campaign.platform}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${campaign.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{campaign.status}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div><p className="text-xs text-gray-500">Spend</p><p className="font-mono text-sm">{campaign.spend}</p></div>
                    <div><p className="text-xs text-gray-500">Leads</p><p className="font-mono text-sm">{campaign.leads}</p></div>
                    <div><p className="text-xs text-gray-500">CPL</p><p className={`font-mono text-sm ${parseFloat(campaign.cpl.slice(1)) < 15 ? "text-emerald-600" : parseFloat(campaign.cpl.slice(1)) < 25 ? "text-yellow-600" : "text-red-600"}`}>{campaign.cpl}</p></div>
                    <div>
                      <p className="text-xs text-gray-500">Health</p>
                      <div className={`w-3 h-3 rounded-full mx-auto mt-1 ${parseFloat(campaign.cpl.slice(1)) < 15 ? "bg-emerald-500" : parseFloat(campaign.cpl.slice(1)) < 25 ? "bg-yellow-500" : "bg-red-500"}`} />
                    </div>
                  </div>
                </div>
              ))}
              {contentQueue.filter(c => c.agent_id === 2 && c.status === "pending_review").map(item => (
                <div key={item.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-medium text-[#1a365d] text-sm mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.content}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleContentAction(item.id, "approve")} className="bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg">Approve</button>
                    <button onClick={() => handleContentAction(item.id, "reject")} className="bg-gray-200 text-gray-700 text-xs px-4 py-2 rounded-lg">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TRACKER ANALYSIS VIEW */}
          {view === "tracker" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#1a365d]">Tracker Analysis Engine</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Active Users</p><p className="text-2xl font-bold font-mono text-[#1a365d]">284</p></div>
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Summaries Today</p><p className="text-2xl font-bold font-mono text-blue-600">12</p></div>
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Flare Alerts</p><p className="text-2xl font-bold font-mono text-red-600">3</p></div>
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Visit Preps</p><p className="text-2xl font-bold font-mono text-purple-600">2</p></div>
              </div>
              {contentQueue.filter(c => c.agent_id === 3).map(item => (
                <div key={item.id} className={`bg-white rounded-xl border p-4 ${item.priority === "urgent" ? "border-red-300" : "border-gray-200"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.priority === "urgent" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{item.priority}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.content_type.replace("_", " ")}</span>
                  </div>
                  <h4 className="font-medium text-[#1a365d] text-sm">{item.title}</h4>
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{item.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* TRANSFER COMMS VIEW */}
          {view === "transfers" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#1a365d]">Transfer Pipeline</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  {[
                    { label: "Submitted", count: 12, color: "bg-blue-500" },
                    { label: "Eligibility OK", count: 8, color: "bg-cyan-500" },
                    { label: "Transfer Req", count: 5, color: "bg-purple-500" },
                    { label: "PA Initiated", count: 3, color: "bg-orange-500" },
                    { label: "Complete", count: 2, color: "bg-emerald-500" },
                  ].map((stage, i) => (
                    <div key={i} className="flex-1 text-center">
                      <div className={`${stage.color} text-white text-lg font-bold w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2`}>{stage.count}</div>
                      <p className="text-xs text-gray-600">{stage.label}</p>
                      {i < 4 && <div className="hidden md:block absolute h-0.5 bg-gray-300 w-full top-1/2" />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-bold text-[#1a365d] mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Avg time to PA approval:</span> <strong>4.2 days</strong></div>
                  <div><span className="text-gray-500">Transfer completion rate:</span> <strong>82%</strong></div>
                  <div><span className="text-gray-500">Messages sent today:</span> <strong>5</strong></div>
                  <div><span className="text-gray-500">Exceptions needing review:</span> <strong className="text-red-600">1</strong></div>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-bold text-red-700 text-sm mb-2">Exception: PA Pending &gt; 7 Days</h4>
                <p className="text-sm text-gray-700">Patient jenny.k (Cosentyx, Medicare) — submitted 5 days ago, no PA response from insurer. Consider calling the payer directly.</p>
                <button className="mt-2 bg-red-600 text-white text-xs px-4 py-2 rounded-lg">Escalate</button>
              </div>
            </div>
          )}

          {/* OUTREACH VIEW */}
          {view === "outreach" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#1a365d]">Rheumatologist Outreach</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Contacted</p><p className="text-2xl font-bold font-mono text-[#1a365d]">450</p></div>
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Opened</p><p className="text-2xl font-bold font-mono text-blue-600">68</p></div>
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Interested</p><p className="text-2xl font-bold font-mono text-emerald-600">34</p></div>
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Active Partners</p><p className="text-2xl font-bold font-mono text-purple-600">8</p></div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-bold text-[#1a365d] mb-3">Outreach Pipeline</h3>
                <div className="space-y-2">
                  {[
                    { stage: "Not Contacted", count: 5397, pct: 92 },
                    { stage: "Email 1 Sent", count: 300, pct: 5 },
                    { stage: "Email 2 Sent", count: 100, pct: 2 },
                    { stage: "Email 3 Sent", count: 50, pct: 1 },
                    { stage: "Responded", count: 34, pct: 0.6 },
                    { stage: "Active Partner", count: 8, pct: 0.1 },
                  ].map(({ stage, count, pct }) => (
                    <div key={stage} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-28 truncate">{stage}</span>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2563eb] rounded-full" style={{ width: `${Math.max(2, pct)}%` }} />
                      </div>
                      <span className="text-xs font-mono text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              {contentQueue.filter(c => c.agent_id === 5 && c.status === "pending_review").map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="font-medium text-[#1a365d] text-sm mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{item.content}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleContentAction(item.id, "approve")} className="bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg">Approve & Send</button>
                    <button className="bg-blue-500 text-white text-xs px-4 py-2 rounded-lg">Edit</button>
                    <button onClick={() => handleContentAction(item.id, "reject")} className="bg-gray-200 text-gray-700 text-xs px-4 py-2 rounded-lg">Skip</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CONTENT PRODUCER VIEW */}
          {view === "content" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#1a365d]">Content Producer</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Articles (Month)</p><p className="text-2xl font-bold font-mono text-[#1a365d]">8</p></div>
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Social Posts</p><p className="text-2xl font-bold font-mono text-blue-600">22</p></div>
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">FAQs</p><p className="text-2xl font-bold font-mono text-purple-600">12</p></div>
                <div className="bg-white rounded-xl p-4 border"><p className="text-xs text-gray-500">Pending Review</p><p className="text-2xl font-bold font-mono text-orange-600">{contentQueue.filter(c => c.agent_id === 6 && c.status === "pending_review").length}</p></div>
              </div>
              {contentQueue.filter(c => c.agent_id === 6).map(item => (
                <div key={item.id} className={`bg-white rounded-xl border p-4 ${item.status === "pending_review" ? "border-blue-200" : "border-gray-200"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.content_type.replace("_", " ")}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === "approved" ? "bg-emerald-100 text-emerald-700" : item.status === "pending_review" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{item.status.replace("_", " ")}</span>
                  </div>
                  <h4 className="font-medium text-[#1a365d] text-sm">{item.title}</h4>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{item.content}</p>
                  {item.status === "pending_review" && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleContentAction(item.id, "approve")} className="bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg">Approve</button>
                      <button className="bg-blue-500 text-white text-xs px-4 py-2 rounded-lg">Edit</button>
                      <button onClick={() => handleContentAction(item.id, "reject")} className="bg-gray-200 text-gray-700 text-xs px-4 py-2 rounded-lg">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* FULL QUEUE VIEW */}
          {view === "queue" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#1a365d]">All Content Queue ({pendingCount} pending)</h2>
              {contentQueue.map(item => (
                <div key={item.id} className={`bg-white rounded-xl border p-4 ${item.status === "pending_review" ? "border-orange-200" : item.status === "approved" ? "border-emerald-200" : "border-gray-200"}`}>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`w-2 h-2 rounded-full ${item.priority === "urgent" ? "bg-red-500" : item.priority === "high" ? "bg-orange-500" : "bg-blue-500"}`} />
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{agents.find((a: any) => a.id === item.agent_id)?.agent_name || `Agent ${item.agent_id}`}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.content_type.replace(/_/g, " ")}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === "approved" ? "bg-emerald-100 text-emerald-700" : item.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{item.status.replace("_", " ")}</span>
                    <span className="text-xs text-gray-400 ml-auto">{timeAgo(item.created_at)}</span>
                  </div>
                  <h4 className="font-medium text-[#1a365d] text-sm">{item.title}</h4>
                  {expandedContent === item.id ? (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 whitespace-pre-line">{item.content}</p>
                      <div className="flex gap-2 mt-3">
                        {item.status === "pending_review" && (
                          <>
                            <button onClick={() => handleContentAction(item.id, "approve")} className="bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg">Approve</button>
                            <button onClick={() => handleContentAction(item.id, "reject")} className="bg-red-500 text-white text-xs px-4 py-2 rounded-lg">Reject</button>
                          </>
                        )}
                        <button onClick={() => setExpandedContent(null)} className="bg-gray-200 text-gray-700 text-xs px-4 py-2 rounded-lg">Collapse</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setExpandedContent(item.id)} className="text-xs text-[#2563eb] hover:underline mt-1">
                      {item.status === "pending_review" ? "Review →" : "View →"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
