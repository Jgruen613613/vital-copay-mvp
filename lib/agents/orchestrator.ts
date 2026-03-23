import { Agent, AgentRun, ContentQueueItem } from "./types";

// ============================================================
// AGENT ORCHESTRATOR
// Central coordination layer for all 6 agents
// ============================================================

const agents: Agent[] = [
  {
    id: 1, agent_name: "Community Monitor", agent_type: "community_monitor",
    description: "Scans patient communities every 2 hours for biologic affordability posts, pharmacy complaints, and copay discussions. Flags high-urgency posts and drafts empathetic responses.",
    schedule: "every_2h", is_active: true,
    config: { platforms: ["reddit", "facebook", "inspire", "myra_team", "mylupus_team"], max_responses_per_run: 20 },
    last_run_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    last_run_status: "success",
    last_run_summary: "Scanned 6 platforms. Found 8 relevant posts. 3 flagged urgent. 5 responses drafted.",
    total_runs: 156, total_items_processed: 1247,
  },
  {
    id: 2, agent_name: "Ad Optimizer", agent_type: "ad_optimizer",
    description: "Daily analysis of Meta/Google campaign performance. Identifies winning vs losing creatives, recommends budget reallocation, generates new ad copy variants.",
    schedule: "daily", is_active: true,
    config: { platforms: ["meta", "google"], auto_pause_threshold_cpl: 35 },
    last_run_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    last_run_status: "success",
    last_run_summary: "Analyzed 4 campaigns. CPL improved 12% WoW. Paused 2 underperformers. Generated 3 new variants.",
    total_runs: 23, total_items_processed: 92,
  },
  {
    id: 3, agent_name: "Tracker Analysis Engine", agent_type: "tracker_analysis",
    description: "Real-time analysis of patient symptom logs. Generates weekly summaries, flare alerts, visit prep documents, and contextual conversion prompts.",
    schedule: "realtime", is_active: true,
    config: { weekly_summary_day: "sunday", visit_prep_hours_before: 48, conversion_prompts_enabled: true },
    last_run_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    last_run_status: "success",
    last_run_summary: "Analyzed 47 patient logs. 12 weekly summaries. 3 flare alerts. 2 visit preps.",
    total_runs: 892, total_items_processed: 4218,
  },
  {
    id: 4, agent_name: "Transfer Communications", agent_type: "transfer_communications",
    description: "Manages all patient communications throughout the prescription transfer lifecycle. Status updates, exception handling, personalized messages.",
    schedule: "realtime", is_active: true,
    config: { sms_enabled: true, email_enabled: true, escalation_after_days: 5 },
    last_run_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    last_run_status: "success",
    last_run_summary: "Sent 5 status updates. 2 transfers advanced to PA. 1 exception flagged.",
    total_runs: 341, total_items_processed: 1589,
  },
  {
    id: 5, agent_name: "Rheumatologist Outreach", agent_type: "rheumatologist_outreach",
    description: "Weekly batch outreach to rheumatology practices. Personalized emails, 3-touch follow-up sequences, practice prioritization.",
    schedule: "weekly", is_active: true,
    config: { batch_size: 150, sequence_steps: 3, days_between_steps: [0, 8, 21] },
    last_run_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_run_status: "success",
    last_run_summary: "Sent 150 outreach emails. 23 opened (15.3%). 8 clicked. 2 replied interested.",
    total_runs: 8, total_items_processed: 1200,
  },
  {
    id: 6, agent_name: "Content Producer", agent_type: "content_producer",
    description: "Produces articles, FAQs, social content 3x/week. Sources topics from community questions, keyword gaps, trending concerns.",
    schedule: "3x_weekly", is_active: true,
    config: { articles_per_week: 2, social_posts_per_week: 5, min_word_count: 800 },
    last_run_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    last_run_status: "success",
    last_run_summary: "Produced 2 articles, 5 social posts, 3 FAQs. All pending review.",
    total_runs: 34, total_items_processed: 278,
  },
];

const recentRuns: AgentRun[] = [
  { id: 1, agent_id: 1, started_at: new Date(Date.now() - 2 * 3600000).toISOString(), completed_at: new Date(Date.now() - 2 * 3600000 + 180000).toISOString(), status: "success", items_processed: 8, items_flagged: 3, summary: "Found 3 urgent affordability posts in r/rheumatoid and r/lupus", output: {}, human_review_needed: true },
  { id: 2, agent_id: 4, started_at: new Date(Date.now() - 2700000).toISOString(), completed_at: new Date(Date.now() - 2640000).toISOString(), status: "success", items_processed: 5, items_flagged: 1, summary: "Sent PA update to sarah.m. Flagged jenny.k transfer for review.", output: {}, human_review_needed: true },
  { id: 3, agent_id: 3, started_at: new Date(Date.now() - 900000).toISOString(), completed_at: new Date(Date.now() - 840000).toISOString(), status: "success", items_processed: 12, items_flagged: 3, summary: "3 flare alerts triggered. 12 weekly summaries generated.", output: {}, human_review_needed: false },
  { id: 4, agent_id: 6, started_at: new Date(Date.now() - 86400000).toISOString(), completed_at: new Date(Date.now() - 86100000).toISOString(), status: "success", items_processed: 10, items_flagged: 0, summary: "2 articles + 5 social posts + 3 FAQs drafted.", output: {}, human_review_needed: true },
  { id: 5, agent_id: 2, started_at: new Date(Date.now() - 50400000).toISOString(), completed_at: new Date(Date.now() - 50100000).toISOString(), status: "success", items_processed: 4, items_flagged: 2, summary: "Paused 2 underperforming creatives. CPL down to $12.40.", output: {}, human_review_needed: true },
  { id: 6, agent_id: 5, started_at: new Date(Date.now() - 259200000).toISOString(), completed_at: new Date(Date.now() - 258000000).toISOString(), status: "success", items_processed: 150, items_flagged: 2, summary: "150 emails sent. 2 practices responded interested.", output: {}, human_review_needed: true },
];

const contentQueue: ContentQueueItem[] = [
  { id: 1, agent_id: 1, content_type: "community_response", title: "r/rheumatoid: Insurance dropped Humira coverage", content: "I'm so sorry you're going through this...", metadata: { platform: "reddit", urgency: "critical" }, priority: "urgent", status: "pending_review", created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 2, agent_id: 1, content_type: "community_response", title: "r/PsoriaticArthritis: Affordable Rinvoq alternatives", content: "Great question. Rinvoq's list price is steep but...", metadata: { platform: "reddit", urgency: "high" }, priority: "high", status: "pending_review", created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, agent_id: 2, content_type: "ad_creative", title: "Ad Variant: Financial Relief v4", content: "Your biologic shouldn't cost $5,000/year...", metadata: { campaign: "RA Copay Relief" }, priority: "normal", status: "pending_review", created_at: new Date(Date.now() - 50400000).toISOString() },
  { id: 4, agent_id: 2, content_type: "ad_recommendation", title: "Budget Shift: Tracker → Offer Page", content: "Tracker CPL $22.40 vs Offer CPL $12.40...", metadata: {}, priority: "normal", status: "pending_review", created_at: new Date(Date.now() - 50400000).toISOString() },
  { id: 5, agent_id: 6, content_type: "article", title: "Why Your Biologic Costs $5,000/Year", content: "Full article draft...", metadata: { word_count: 1800 }, priority: "normal", status: "pending_review", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 6, agent_id: 6, content_type: "social_post", title: "Morning stiffness stat (Instagram)", content: "If your morning stiffness lasts more than 30 minutes...", metadata: { platform: "instagram" }, priority: "low", status: "pending_review", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 7, agent_id: 5, content_type: "outreach_email", title: "Dr. Martinez, Austin Rheumatology", content: "Subject: Free symptom tracking tool...", metadata: { practice_name: "Austin Rheumatology Associates", sequence_step: 1 }, priority: "normal", status: "pending_review", created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: 8, agent_id: 3, content_type: "patient_alert", title: "Flare Alert: Patient #47", content: "Sharp symptom escalation: pain 3→5→8...", metadata: { urgency: "critical" }, priority: "urgent", status: "pending_review", created_at: new Date(Date.now() - 900000).toISOString() },
];

// ---- MODULE FUNCTIONS ----

export function getAgentStatuses(): Agent[] {
  return agents;
}

export function getAgent(agentId: number): Agent | undefined {
  return agents.find(a => a.id === agentId);
}

export function runAgent(agentId: number): AgentRun {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) throw new Error(`Agent ${agentId} not found`);

  const run: AgentRun = {
    id: recentRuns.length + 1,
    agent_id: agentId,
    started_at: new Date().toISOString(),
    completed_at: null,
    status: "running",
    items_processed: 0,
    items_flagged: 0,
    summary: `${agent.agent_name} started manually...`,
    output: {},
    human_review_needed: false,
  };

  recentRuns.unshift(run);
  agent.last_run_at = run.started_at;
  agent.total_runs++;

  return run;
}

export function getContentQueue(filters?: {
  status?: string;
  agent_id?: number;
  priority?: string;
  content_type?: string;
}): ContentQueueItem[] {
  let result = [...contentQueue];
  if (filters?.status) result = result.filter(c => c.status === filters.status);
  if (filters?.agent_id) result = result.filter(c => c.agent_id === filters.agent_id);
  if (filters?.priority) result = result.filter(c => c.priority === filters.priority);
  if (filters?.content_type) result = result.filter(c => c.content_type === filters.content_type);
  return result;
}

export function approveContent(contentId: number): ContentQueueItem | null {
  const item = contentQueue.find(c => c.id === contentId);
  if (item) item.status = "approved";
  return item || null;
}

export function rejectContent(contentId: number): ContentQueueItem | null {
  const item = contentQueue.find(c => c.id === contentId);
  if (item) item.status = "rejected";
  return item || null;
}

export function getAgentMetrics() {
  return {
    qualified_leads_this_month: 127,
    transfer_initiations_this_week: 23,
    community_posts_flagged_today: 8,
    content_pending_review: contentQueue.filter(c => c.status === "pending_review").length,
    total_tracker_users: 284,
    active_transfers: 12,
    rheum_practices_contacted: 450,
    rheum_practices_interested: 34,
    avg_cpl: 14.20,
    monthly_ad_spend: 4800,
    patient_savings_facilitated: "$342,000",
  };
}

export function getRecentRuns(limit: number = 20): (AgentRun & { agent_name?: string })[] {
  return recentRuns.slice(0, limit).map(run => ({
    ...run,
    agent_name: agents.find(a => a.id === run.agent_id)?.agent_name,
  }));
}

export function toggleAgent(agentId: number): boolean {
  const agent = agents.find(a => a.id === agentId);
  if (agent) {
    agent.is_active = !agent.is_active;
    return agent.is_active;
  }
  return false;
}
