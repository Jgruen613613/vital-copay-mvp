// Operations Dashboard Mock Data
// All types and getter functions for the ops dashboard

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue: number;
  activeClients: number;
  pipelineValue: number;
  licensingPipelineValue: number;
  agentRuns: number;
  reviewQueuePending: number;
  milestoneProgress: number;
}

export interface RevenueEntry {
  date: string;
  amount: number;
  source: "consulting" | "licensing" | "retainer";
}

export interface AgentRun {
  id: string;
  agentName: string;
  agentType: "gtm_monitor" | "lead_researcher" | "knowledge_updater" | "sample_producer" | "licensing_pipeline" | "content_engine";
  status: "running" | "idle" | "error";
  lastRunTime: string;
  itemsProcessed: number;
  itemsPendingReview: number;
  systemPromptPreview: string;
  runHistory: { timestamp: string; itemsProcessed: number; status: "success" | "error" }[];
}

export interface ReviewQueueItem {
  id: string;
  type: "linkedin_post" | "outreach_email" | "knowledge_entry" | "sample_brief" | "market_intel";
  title: string;
  contentPreview: string;
  targetPlatform: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected" | "edited";
  agentSource: string;
}

export interface ExecutionMilestone {
  id: string;
  phase: 1 | 2 | 3;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  targetMetric: string;
  actualMetric: string;
  targetDay: number;
  completedDay?: number;
}

export interface Prospect {
  id: string;
  companyName: string;
  contactName: string;
  contactTitle: string;
  email: string;
  vertical: string;
  stage: "identified" | "sample_sent" | "responded" | "meeting_booked" | "proposal_sent" | "closed_won" | "closed_lost";
  switchingIntentScore: number;
  estimatedMonthlySpend: number;
  daysInStage: number;
  sourceAgent: string;
  notes: string;
  lastActivity: string;
}

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  contactTitle: string;
  email: string;
  vertical: string;
  packageTier: "starter" | "growth" | "scale";
  monthlyRate: number;
  deliverablesCompleted: number;
  deliverablesTotal: number;
  totalRevenue: number;
  satisfaction: number;
  status: "active" | "paused" | "churned";
  startDate: string;
  notes: string;
  timeline: { date: string; event: string }[];
}

export interface KnowledgeBaseEntry {
  id: string;
  vertical: string;
  category: string;
  title: string;
  summary: string;
  fullContent?: string;
  sourceUrl?: string;
  relevanceScore: number;
  tags: string[];
  agentGenerated: boolean;
  verified: boolean;
  source: string;
  createdAt: string;
}

export interface LicensingProspect {
  id: string;
  name: string;
  title: string;
  company: string;
  followers: number;
  tierInterest: "operator" | "builder" | "partner";
  stage: "identified" | "outreach_sent" | "replied" | "demo_booked" | "demo_completed" | "proposal_sent" | "negotiating" | "closed_won" | "closed_lost";
  dealValue: number;
  nextAction: string;
  demoDate?: string;
  notes: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const EXECUTION_START_DATE = "2026-03-01";

export function getCurrentDay(): number {
  const start = new Date(EXECUTION_START_DATE);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockRevenueEntries: RevenueEntry[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date("2026-03-01");
  date.setDate(date.getDate() + i);
  const sources: ("consulting" | "licensing" | "retainer")[] = ["consulting", "licensing", "retainer"];
  return {
    date: date.toISOString().split("T")[0],
    amount: i < 5 ? 0 : Math.floor(Math.random() * 3000) + (i > 15 ? 2000 : 500),
    source: sources[i % 3],
  };
});

const mockAgentRuns: AgentRun[] = [
  {
    id: "agent-1",
    agentName: "GTM Monitor",
    agentType: "gtm_monitor",
    status: "idle",
    lastRunTime: "2026-03-23T08:30:00Z",
    itemsProcessed: 47,
    itemsPendingReview: 3,
    systemPromptPreview: "Monitor target verticals for switching signals: pricing complaints, contract renewals, leadership changes, M&A activity. Score each signal 1-10 for switching intent...",
    runHistory: [
      { timestamp: "2026-03-23T08:30:00Z", itemsProcessed: 12, status: "success" },
      { timestamp: "2026-03-22T08:30:00Z", itemsProcessed: 8, status: "success" },
      { timestamp: "2026-03-21T08:30:00Z", itemsProcessed: 15, status: "success" },
      { timestamp: "2026-03-20T08:30:00Z", itemsProcessed: 5, status: "error" },
      { timestamp: "2026-03-19T08:30:00Z", itemsProcessed: 7, status: "success" },
    ],
  },
  {
    id: "agent-2",
    agentName: "Lead Researcher",
    agentType: "lead_researcher",
    status: "running",
    lastRunTime: "2026-03-23T09:15:00Z",
    itemsProcessed: 23,
    itemsPendingReview: 5,
    systemPromptPreview: "For each identified prospect, build a comprehensive profile: company size, current tech stack, decision makers, budget cycle, pain points. Cross-reference with LinkedIn...",
    runHistory: [
      { timestamp: "2026-03-23T09:15:00Z", itemsProcessed: 6, status: "success" },
      { timestamp: "2026-03-22T09:00:00Z", itemsProcessed: 4, status: "success" },
      { timestamp: "2026-03-21T09:00:00Z", itemsProcessed: 5, status: "success" },
      { timestamp: "2026-03-20T09:00:00Z", itemsProcessed: 3, status: "success" },
      { timestamp: "2026-03-19T09:00:00Z", itemsProcessed: 5, status: "error" },
    ],
  },
  {
    id: "agent-3",
    agentName: "Knowledge Updater",
    agentType: "knowledge_updater",
    status: "idle",
    lastRunTime: "2026-03-23T06:00:00Z",
    itemsProcessed: 156,
    itemsPendingReview: 2,
    systemPromptPreview: "Scan industry sources for new case studies, benchmark data, competitor moves, and regulatory changes. Update the knowledge base with structured entries...",
    runHistory: [
      { timestamp: "2026-03-23T06:00:00Z", itemsProcessed: 34, status: "success" },
      { timestamp: "2026-03-22T06:00:00Z", itemsProcessed: 28, status: "success" },
      { timestamp: "2026-03-21T06:00:00Z", itemsProcessed: 31, status: "success" },
      { timestamp: "2026-03-20T06:00:00Z", itemsProcessed: 29, status: "success" },
      { timestamp: "2026-03-19T06:00:00Z", itemsProcessed: 34, status: "success" },
    ],
  },
  {
    id: "agent-4",
    agentName: "Sample Producer",
    agentType: "sample_producer",
    status: "idle",
    lastRunTime: "2026-03-23T07:00:00Z",
    itemsProcessed: 18,
    itemsPendingReview: 4,
    systemPromptPreview: "Generate tailored sample deliverables for prospects in the pipeline. Each sample should demonstrate our methodology applied to their specific vertical and pain points...",
    runHistory: [
      { timestamp: "2026-03-23T07:00:00Z", itemsProcessed: 3, status: "success" },
      { timestamp: "2026-03-22T07:00:00Z", itemsProcessed: 4, status: "success" },
      { timestamp: "2026-03-21T07:00:00Z", itemsProcessed: 2, status: "success" },
      { timestamp: "2026-03-20T07:00:00Z", itemsProcessed: 5, status: "success" },
      { timestamp: "2026-03-19T07:00:00Z", itemsProcessed: 4, status: "error" },
    ],
  },
  {
    id: "agent-5",
    agentName: "Licensing Pipeline",
    agentType: "licensing_pipeline",
    status: "error",
    lastRunTime: "2026-03-23T10:00:00Z",
    itemsProcessed: 12,
    itemsPendingReview: 1,
    systemPromptPreview: "Identify potential licensing partners from creator/agency databases. Score by audience size, engagement rate, vertical alignment, and existing tech stack...",
    runHistory: [
      { timestamp: "2026-03-23T10:00:00Z", itemsProcessed: 0, status: "error" },
      { timestamp: "2026-03-22T10:00:00Z", itemsProcessed: 3, status: "success" },
      { timestamp: "2026-03-21T10:00:00Z", itemsProcessed: 2, status: "success" },
      { timestamp: "2026-03-20T10:00:00Z", itemsProcessed: 4, status: "success" },
      { timestamp: "2026-03-19T10:00:00Z", itemsProcessed: 3, status: "success" },
    ],
  },
  {
    id: "agent-6",
    agentName: "Content Engine",
    agentType: "content_engine",
    status: "idle",
    lastRunTime: "2026-03-23T07:45:00Z",
    itemsProcessed: 89,
    itemsPendingReview: 6,
    systemPromptPreview: "Generate daily LinkedIn posts, Twitter threads, and newsletter content. Use the knowledge base for data points. Match founder voice and tone guidelines...",
    runHistory: [
      { timestamp: "2026-03-23T07:45:00Z", itemsProcessed: 4, status: "success" },
      { timestamp: "2026-03-22T07:45:00Z", itemsProcessed: 5, status: "success" },
      { timestamp: "2026-03-21T07:45:00Z", itemsProcessed: 3, status: "success" },
      { timestamp: "2026-03-20T07:45:00Z", itemsProcessed: 4, status: "success" },
      { timestamp: "2026-03-19T07:45:00Z", itemsProcessed: 6, status: "success" },
    ],
  },
];

const mockReviewQueue: ReviewQueueItem[] = [
  {
    id: "rq-1",
    type: "linkedin_post",
    title: "Why 78% of Mid-Market Companies Overpay for GTM Tools",
    contentPreview: "Most mid-market companies are paying enterprise prices for tools they use at 30% capacity. Here's the data...",
    targetPlatform: "LinkedIn",
    timestamp: "2026-03-23T08:00:00Z",
    status: "pending",
    agentSource: "Content Engine",
  },
  {
    id: "rq-2",
    type: "outreach_email",
    title: "Intro Email: Meridian Health Systems",
    contentPreview: "Hi Sarah, I noticed Meridian recently expanded to 3 new states. When companies scale that fast, their GTM stack often...",
    targetPlatform: "Email",
    timestamp: "2026-03-23T07:30:00Z",
    status: "pending",
    agentSource: "Lead Researcher",
  },
  {
    id: "rq-3",
    type: "knowledge_entry",
    title: "Competitor Analysis: Acme Corp Q1 Pricing Change",
    contentPreview: "Acme Corp increased their base tier pricing by 22% effective March 1st. Customer sentiment on G2 has dropped from 4.2 to 3.8...",
    targetPlatform: "Knowledge Base",
    timestamp: "2026-03-23T06:15:00Z",
    status: "pending",
    agentSource: "Knowledge Updater",
  },
  {
    id: "rq-4",
    type: "sample_brief",
    title: "Sample Deliverable: NovaTech Solutions GTM Audit",
    contentPreview: "Executive Summary: NovaTech's current GTM spend of $42K/mo can be optimized by 35% through stack consolidation...",
    targetPlatform: "PDF",
    timestamp: "2026-03-22T16:00:00Z",
    status: "pending",
    agentSource: "Sample Producer",
  },
  {
    id: "rq-5",
    type: "linkedin_post",
    title: "The 3 Signals That a Company Is Ready to Switch GTM Platforms",
    contentPreview: "After analyzing 200+ mid-market transitions, three patterns emerge before every major platform switch...",
    targetPlatform: "LinkedIn",
    timestamp: "2026-03-22T14:00:00Z",
    status: "approved",
    agentSource: "Content Engine",
  },
  {
    id: "rq-6",
    type: "market_intel",
    title: "Vertical Trend: Healthcare SaaS Consolidation Wave",
    contentPreview: "Three major healthcare SaaS acquisitions in the past 2 weeks signal accelerating consolidation. Key targets include...",
    targetPlatform: "Knowledge Base",
    timestamp: "2026-03-22T10:00:00Z",
    status: "approved",
    agentSource: "GTM Monitor",
  },
  {
    id: "rq-7",
    type: "outreach_email",
    title: "Follow-up: BrightPath Analytics",
    contentPreview: "Hi Mike, following up on the GTM audit sample we sent last week. I noticed BrightPath just posted 3 new SDR roles...",
    targetPlatform: "Email",
    timestamp: "2026-03-22T09:00:00Z",
    status: "rejected",
    agentSource: "Lead Researcher",
  },
];

const mockMilestones: ExecutionMilestone[] = [
  // Phase 1: Foundation & First Revenue (Days 1-21)
  { id: "m-1", phase: 1, title: "Launch MVP landing page", description: "Deploy the core website with lead capture", status: "completed", targetMetric: "Live site", actualMetric: "Deployed", targetDay: 1, completedDay: 1 },
  { id: "m-2", phase: 1, title: "Configure agent stack", description: "Set up all 6 AI agents with system prompts and schedules", status: "completed", targetMetric: "6 agents", actualMetric: "6 agents", targetDay: 3, completedDay: 3 },
  { id: "m-3", phase: 1, title: "First 50 prospects identified", description: "GTM Monitor identifies initial prospect list", status: "completed", targetMetric: "50 prospects", actualMetric: "63 prospects", targetDay: 7, completedDay: 5 },
  { id: "m-4", phase: 1, title: "First 10 samples sent", description: "Generate and send tailored sample deliverables", status: "completed", targetMetric: "10 samples", actualMetric: "12 samples", targetDay: 10, completedDay: 9 },
  { id: "m-5", phase: 1, title: "First paying client", description: "Close first consulting engagement", status: "completed", targetMetric: "$3,000 MRR", actualMetric: "$3,500 MRR", targetDay: 14, completedDay: 12 },
  { id: "m-6", phase: 1, title: "3 active clients", description: "Reach 3 paying consulting clients", status: "in_progress", targetMetric: "$9,000 MRR", actualMetric: "$7,000 MRR", targetDay: 21 },
  // Phase 2: Compounding Engine (Days 22-55)
  { id: "m-7", phase: 2, title: "10 active clients", description: "Scale to 10 concurrent consulting engagements", status: "pending", targetMetric: "$30,000 MRR", actualMetric: "—", targetDay: 35 },
  { id: "m-8", phase: 2, title: "First licensing deal closed", description: "Close first Operator tier license", status: "pending", targetMetric: "$8,500", actualMetric: "—", targetDay: 30 },
  { id: "m-9", phase: 2, title: "Knowledge base reaches 500 entries", description: "Comprehensive competitive intelligence database", status: "pending", targetMetric: "500 entries", actualMetric: "156 entries", targetDay: 40 },
  { id: "m-10", phase: 2, title: "Content flywheel: 5K LinkedIn followers", description: "Build audience through consistent thought leadership", status: "pending", targetMetric: "5,000 followers", actualMetric: "1,200 followers", targetDay: 45 },
  { id: "m-11", phase: 2, title: "$50K cumulative revenue", description: "Hit first major revenue milestone", status: "pending", targetMetric: "$50,000", actualMetric: "$10,500", targetDay: 50 },
  // Phase 3: The Push to $1M (Days 56-90)
  { id: "m-12", phase: 3, title: "20 active clients", description: "Scale consulting arm to 20 clients", status: "pending", targetMetric: "$60,000 MRR", actualMetric: "—", targetDay: 65 },
  { id: "m-13", phase: 3, title: "5 Operator licenses sold", description: "Fill 1/6 of Operator tier capacity", status: "pending", targetMetric: "$42,500", actualMetric: "—", targetDay: 70 },
  { id: "m-14", phase: 3, title: "First Builder license sold", description: "Move up-market with Builder tier", status: "pending", targetMetric: "$22,500", actualMetric: "—", targetDay: 75 },
  { id: "m-15", phase: 3, title: "$100K monthly run rate", description: "Achieve six-figure monthly revenue", status: "pending", targetMetric: "$100K MRR", actualMetric: "—", targetDay: 80 },
  { id: "m-16", phase: 3, title: "Pipeline to $1M ARR", description: "Sufficient pipeline to project $1M annual revenue", status: "pending", targetMetric: "$83K MRR", actualMetric: "—", targetDay: 90 },
];

const mockProspects: Prospect[] = [
  { id: "p-1", companyName: "Meridian Health Systems", contactName: "Sarah Chen", contactTitle: "VP of Revenue Operations", email: "s.chen@meridianhealth.com", vertical: "Healthcare", stage: "meeting_booked", switchingIntentScore: 8, estimatedMonthlySpend: 4500, daysInStage: 3, sourceAgent: "GTM Monitor", notes: "Expanding to 3 new states, current GTM stack struggling to scale", lastActivity: "2026-03-22" },
  { id: "p-2", companyName: "NovaTech Solutions", contactName: "Mike Rodriguez", contactTitle: "CRO", email: "mike@novatech.io", vertical: "SaaS", stage: "sample_sent", switchingIntentScore: 7, estimatedMonthlySpend: 5000, daysInStage: 5, sourceAgent: "Lead Researcher", notes: "Posted about GTM tool frustration on LinkedIn", lastActivity: "2026-03-20" },
  { id: "p-3", companyName: "BrightPath Analytics", contactName: "Lisa Park", contactTitle: "Head of Growth", email: "lisa@brightpath.co", vertical: "Analytics", stage: "responded", switchingIntentScore: 6, estimatedMonthlySpend: 3500, daysInStage: 2, sourceAgent: "GTM Monitor", notes: "Currently evaluating 3 vendors", lastActivity: "2026-03-21" },
  { id: "p-4", companyName: "Cascade Financial", contactName: "David Kim", contactTitle: "SVP Marketing", email: "dkim@cascadefinancial.com", vertical: "FinTech", stage: "proposal_sent", switchingIntentScore: 9, estimatedMonthlySpend: 6000, daysInStage: 4, sourceAgent: "Lead Researcher", notes: "Contract with current vendor expires next month", lastActivity: "2026-03-22" },
  { id: "p-5", companyName: "Vertex Manufacturing", contactName: "Tom Harris", contactTitle: "Director of Sales", email: "tharris@vertexmfg.com", vertical: "Manufacturing", stage: "identified", switchingIntentScore: 5, estimatedMonthlySpend: 3000, daysInStage: 1, sourceAgent: "GTM Monitor", notes: "New CRO hire — likely reviewing all tools", lastActivity: "2026-03-23" },
  { id: "p-6", companyName: "Pinnacle Education", contactName: "Amy Frost", contactTitle: "VP Sales", email: "afrost@pinnacleedu.com", vertical: "EdTech", stage: "identified", switchingIntentScore: 4, estimatedMonthlySpend: 2500, daysInStage: 2, sourceAgent: "GTM Monitor", notes: "Growing fast, likely to need better tooling soon", lastActivity: "2026-03-22" },
  { id: "p-7", companyName: "Redline Logistics", contactName: "James O'Brien", contactTitle: "CRO", email: "jobrien@redlinelogistics.com", vertical: "Logistics", stage: "closed_won", switchingIntentScore: 9, estimatedMonthlySpend: 4000, daysInStage: 0, sourceAgent: "Lead Researcher", notes: "Signed $4K/mo retainer — first client!", lastActivity: "2026-03-15" },
  { id: "p-8", companyName: "Spark Digital Agency", contactName: "Nina Patel", contactTitle: "Managing Director", email: "nina@sparkdigital.com", vertical: "Agency", stage: "closed_won", switchingIntentScore: 8, estimatedMonthlySpend: 3500, daysInStage: 0, sourceAgent: "GTM Monitor", notes: "Signed growth package", lastActivity: "2026-03-18" },
  { id: "p-9", companyName: "Atlas Cloud Services", contactName: "Robert Yang", contactTitle: "VP Revenue", email: "ryang@atlascloud.io", vertical: "SaaS", stage: "sample_sent", switchingIntentScore: 7, estimatedMonthlySpend: 5500, daysInStage: 3, sourceAgent: "Lead Researcher", notes: "Series B company, scaling sales team rapidly", lastActivity: "2026-03-21" },
  { id: "p-10", companyName: "GreenField Energy", contactName: "Kate Morrison", contactTitle: "Head of Sales", email: "kmorrison@greenfieldenergy.com", vertical: "CleanTech", stage: "closed_lost", switchingIntentScore: 3, estimatedMonthlySpend: 2000, daysInStage: 0, sourceAgent: "GTM Monitor", notes: "Went with in-house solution", lastActivity: "2026-03-10" },
  { id: "p-11", companyName: "Summit Partners Group", contactName: "Alan Wright", contactTitle: "Director RevOps", email: "awright@summitpartners.com", vertical: "FinTech", stage: "meeting_booked", switchingIntentScore: 8, estimatedMonthlySpend: 7000, daysInStage: 1, sourceAgent: "Lead Researcher", notes: "Large enterprise, high-value opportunity", lastActivity: "2026-03-23" },
  { id: "p-12", companyName: "Helix Biotech", contactName: "Dr. Priya Sharma", contactTitle: "Commercial Lead", email: "psharma@helixbio.com", vertical: "Healthcare", stage: "identified", switchingIntentScore: 6, estimatedMonthlySpend: 4000, daysInStage: 1, sourceAgent: "GTM Monitor", notes: "Biotech launching commercial product, building GTM from scratch", lastActivity: "2026-03-23" },
];

const mockClients: Client[] = [
  {
    id: "c-1", companyName: "Redline Logistics", contactName: "James O'Brien", contactTitle: "CRO", email: "jobrien@redlinelogistics.com", vertical: "Logistics",
    packageTier: "growth", monthlyRate: 4000, deliverablesCompleted: 8, deliverablesTotal: 12, totalRevenue: 4000, satisfaction: 9, status: "active", startDate: "2026-03-15",
    notes: "Very engaged. Wants to expand scope next month.",
    timeline: [
      { date: "2026-03-15", event: "Contract signed — Growth package" },
      { date: "2026-03-16", event: "Kickoff call completed" },
      { date: "2026-03-18", event: "GTM audit delivered" },
      { date: "2026-03-20", event: "Competitive analysis delivered" },
      { date: "2026-03-22", event: "Weekly strategy call" },
    ],
  },
  {
    id: "c-2", companyName: "Spark Digital Agency", contactName: "Nina Patel", contactTitle: "Managing Director", email: "nina@sparkdigital.com", vertical: "Agency",
    packageTier: "growth", monthlyRate: 3500, deliverablesCompleted: 5, deliverablesTotal: 12, totalRevenue: 3500, satisfaction: 8, status: "active", startDate: "2026-03-18",
    notes: "Interested in licensing model for their own clients.",
    timeline: [
      { date: "2026-03-18", event: "Contract signed — Growth package" },
      { date: "2026-03-19", event: "Kickoff call completed" },
      { date: "2026-03-21", event: "Initial audit delivered" },
      { date: "2026-03-23", event: "First strategy session" },
    ],
  },
];

const mockLicensingProspects: LicensingProspect[] = [
  { id: "lp-1", name: "Jordan Ellis", title: "Growth Consultant", company: "Ellis Growth Co", followers: 12000, tierInterest: "operator", stage: "demo_booked", dealValue: 8500, nextAction: "Demo on March 25", demoDate: "2026-03-25T14:00:00Z", notes: "Has 15 consulting clients, wants to offer GTM audits" },
  { id: "lp-2", name: "Priya Malhotra", title: "Agency Founder", company: "Ascend Digital", followers: 28000, tierInterest: "builder", stage: "outreach_sent", dealValue: 22500, nextAction: "Follow up March 24", notes: "Runs a 12-person agency, perfect Builder fit" },
  { id: "lp-3", name: "Marcus Chen", title: "Revenue Architect", company: "Chen Advisory", followers: 45000, tierInterest: "partner", stage: "identified", dealValue: 45000, nextAction: "Research complete, draft outreach", notes: "Former VP Sales at Salesforce, massive audience" },
  { id: "lp-4", name: "Aisha Thompson", title: "Fractional CRO", company: "Independent", followers: 8500, tierInterest: "operator", stage: "replied", dealValue: 8500, nextAction: "Schedule intro call", notes: "Interested but wants to see ROI data" },
  { id: "lp-5", name: "Ben Kowalski", title: "GTM Advisor", company: "Kowalski & Co", followers: 19000, tierInterest: "builder", stage: "demo_completed", dealValue: 22500, nextAction: "Send proposal", demoDate: "2026-03-20T15:00:00Z", notes: "Very impressed with demo, ready to move forward" },
  { id: "lp-6", name: "Rachel Torres", title: "Sales Ops Lead", company: "RevScale", followers: 6200, tierInterest: "operator", stage: "proposal_sent", dealValue: 8500, nextAction: "Follow up on proposal", notes: "Sent proposal March 21" },
  { id: "lp-7", name: "Derek Chambers", title: "Founder & CEO", company: "Pipeline Labs", followers: 34000, tierInterest: "partner", stage: "outreach_sent", dealValue: 45000, nextAction: "Awaiting reply", notes: "Created popular sales methodology, huge potential" },
  { id: "lp-8", name: "Sana Mirza", title: "RevOps Consultant", company: "Mirza Consulting", followers: 9800, tierInterest: "operator", stage: "negotiating", dealValue: 8500, nextAction: "Finalize terms", notes: "Wants quarterly payment option" },
];

const mockKnowledgeBase: KnowledgeBaseEntry[] = [
  // Healthcare IT entries
  { id: "kb-1", vertical: "healthcare_it", category: "regulation", title: "TEFCA v2.0 Onboarding Accelerates — 12 QHINs Now Live", summary: "The Trusted Exchange Framework now has 12 designated QHINs processing live queries. Epic and Oracle Health have completed integration testing. Implications for interoperability vendors: the window for standalone HIE solutions is closing.", fullContent: "TEFCA's second wave of QHIN designations brings the total to 12, including CommonWell, eHealth Exchange, and KONZA. The practical impact: any EHR vendor connected to a QHIN can now query patient records across networks without bilateral agreements. For content strategy, this means interoperability is no longer aspirational — it's operational. Clients should shift content from 'why interoperability matters' to 'how to optimize TEFCA-enabled workflows.'", sourceUrl: "https://www.healthit.gov/topic/interoperability/trusted-exchange-framework-and-common-agreement-tefca", relevanceScore: 9, tags: ["TEFCA", "interoperability", "QHIN", "ONC"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-23T06:00:00Z" },
  { id: "kb-2", vertical: "healthcare_it", category: "funding", title: "Abridge Raises $250M Series D for Ambient Clinical Documentation", summary: "Abridge, the AI-powered ambient documentation company, closed a $250M Series D at a $3.5B valuation. Epic partnership expansion announced simultaneously. Signals massive enterprise appetite for AI scribes.", relevanceScore: 8, tags: ["Abridge", "ambient AI", "funding", "clinical documentation"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-22T06:00:00Z" },
  { id: "kb-3", vertical: "healthcare_it", category: "vendor_analysis", title: "Epic vs. Oracle Health: Q1 2026 Market Position Update", summary: "Epic gained 14 new health system contracts in Q1. Oracle Health lost 3 mid-size clients to Epic. athenahealth gaining in ambulatory. Content opportunity: vendor comparison guides for health system CIOs evaluating EHR transitions.", fullContent: "Epic's dominance continues to accelerate post-pandemic. Key data points: 38% of US acute care beds now run on Epic (up from 31% in 2024). Oracle Health's Cerner migration timeline has slipped again — several large clients citing implementation fatigue. For our Healthcare IT clients selling to health systems, this means: (1) Epic integration is table stakes, (2) Oracle Health clients are in a 'wait and see' mode creating sales cycle delays, (3) athenahealth is the dark horse in practices under 50 providers.", relevanceScore: 9, tags: ["Epic", "Oracle Health", "Cerner", "EHR", "market share"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-21T06:00:00Z" },
  { id: "kb-4", vertical: "healthcare_it", category: "regulation", title: "CMS Interoperability Rule: Prior Auth API Deadline Approaching", summary: "January 2027 deadline for payer prior auth APIs now 9 months away. Health plans scrambling to comply. Massive content opportunity for prior auth automation vendors to publish compliance guides.", relevanceScore: 8, tags: ["CMS", "prior auth", "interoperability", "FHIR", "payer"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-20T06:00:00Z" },
  { id: "kb-5", vertical: "healthcare_it", category: "market_trend", title: "AI in Clinical Decision Support: FDA Cleared 173 Algorithms in 2025", summary: "FDA's digital health center cleared 173 AI/ML-enabled medical devices in 2025, up 40% from 2024. Radiology leads (68%) but cardiology (12%) and pathology (8%) growing fastest. Content angle: CDS vendors need regulatory-fluent content.", relevanceScore: 7, tags: ["FDA", "AI", "SaMD", "clinical decision support"], agentGenerated: true, verified: false, source: "Knowledge Updater", createdAt: "2026-03-19T06:00:00Z" },

  // Rheumatology entries
  { id: "kb-6", vertical: "rheumatology", category: "clinical_research", title: "ACR 2026 Updated RA Treatment Guidelines: JAK Inhibitors Repositioned", summary: "ACR revised RA treatment algorithm now positions JAK inhibitors (tofacitinib, upadacitinib, baricitinib) as second-line after TNF failure rather than equal alternatives. Driven by FDA boxed warning data from ORAL Surveillance trial.", fullContent: "The updated ACR guidelines reflect the ORAL Surveillance cardiovascular safety signal for tofacitinib. Practical implications: (1) TNF inhibitors (adalimumab, etanercept) remain first-line biologic therapy, (2) biosimilar adalimumab adoption accelerates as cost becomes the primary differentiator for first-line, (3) IL-17 and IL-23 inhibitors gaining share in PsA as JAK moves down. For rheumatology practice content: emphasize shared decision-making frameworks and patient education about risk-benefit profiles.", relevanceScore: 10, tags: ["ACR", "RA", "JAK inhibitor", "treatment guidelines", "tofacitinib"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-23T06:00:00Z" },
  { id: "kb-7", vertical: "rheumatology", category: "market_trend", title: "Biosimilar Humira Market: 11 Competitors, Price Down 85% from Peak", summary: "Adalimumab biosimilar market now has 11 approved products. Average WAC is 85% below Humira's 2022 peak pricing. AbbVie's Humira volume share below 30% and declining. 340B implications significant.", relevanceScore: 9, tags: ["biosimilar", "Humira", "adalimumab", "340B", "pricing"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-22T06:00:00Z" },
  { id: "kb-8", vertical: "rheumatology", category: "competitor_intel", title: "US Rheumatology Acquires 4 More Practices in Southeast", summary: "PE-backed US Rheumatology (owned by Linden Capital) acquired 4 independent practices in FL and GA, bringing total to 87 locations. Independent practices losing patients to PE groups with better marketing and digital presence.", fullContent: "US Rheumatology's acquisition pace is accelerating. Key implication for our B2B rheumatology clients: independent practices need marketing support urgently to compete. PE-backed groups have full marketing teams, SEO budgets, and patient acquisition funnels. An independent 3-rheumatologist practice has zero marketing infrastructure. This is our exact ICP for both agency services and practice marketing licenses.", relevanceScore: 10, tags: ["PE", "US Rheumatology", "practice acquisition", "Linden Capital"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-21T06:00:00Z" },
  { id: "kb-9", vertical: "rheumatology", category: "regulation", title: "CMS Step Therapy Reform: Biologics Exception for RA Patients", summary: "CMS proposed rule would allow rheumatologists to override step therapy requirements for Medicare patients with RA who have failed one conventional DMARD. Effective date: January 2027.", relevanceScore: 8, tags: ["CMS", "step therapy", "Medicare", "biologics", "RA"], agentGenerated: true, verified: false, source: "Knowledge Updater", createdAt: "2026-03-20T06:00:00Z" },
  { id: "kb-10", vertical: "rheumatology", category: "patient_insight", title: "Patient Survey: 67% of RA Patients Research Biologics Online Before Appointment", summary: "New survey of 2,400 RA patients shows 67% research biologic options online before discussing with rheumatologist. Top sources: WebMD (34%), Reddit r/rheumatoid (22%), pharma patient sites (19%). Content opportunity: SEO-optimized patient education.", relevanceScore: 8, tags: ["patient education", "RA", "SEO", "biologics", "DTC"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-19T06:00:00Z" },

  // Wound Care entries
  { id: "kb-11", vertical: "wound_care", category: "regulation", title: "CMS LCD Update: CTP Coverage Criteria Tightened for 2026", summary: "CMS MAC Novitas revised Local Coverage Determination for cellular and tissue-based products (CTPs). Now requires documented failure of standard wound care for 30 days (up from 14) before CTP application. Major impact on wound care center revenue.", relevanceScore: 9, tags: ["CMS", "LCD", "CTP", "wound care", "coverage"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-22T06:00:00Z" },
  { id: "kb-12", vertical: "wound_care", category: "clinical_research", title: "Autoimmune Wound Management: Vasculitis and Pyoderma Gangrenosum Outcomes Data", summary: "New retrospective study of 340 patients with autoimmune-related chronic wounds shows 45% faster healing when rheumatology and wound care teams co-manage. Direct evidence supporting our cross-specialty content positioning.", fullContent: "The study published in Wound Repair and Regeneration demonstrates that co-management between rheumatology and wound care for vasculitis-related wounds and pyoderma gangrenosum reduces time-to-healing by 45% and reduces hospitalizations by 62%. This is critical evidence for our dual-vertical positioning. Content recommendations: (1) publish a cross-specialty guide for wound care centers on recognizing autoimmune etiologies, (2) create rheumatology practice content on wound care referral pathways, (3) patient education on when to seek wound care vs. rheumatology.", relevanceScore: 10, tags: ["vasculitis", "pyoderma gangrenosum", "autoimmune", "wound care", "co-management"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-21T06:00:00Z" },
  { id: "kb-13", vertical: "wound_care", category: "product_launch", title: "Solsys Medical Launches Next-Gen NPWT Device for Outpatient Use", summary: "New portable NPWT device approved for home use. 40% smaller than competitors. Could shift wound care from facility-based to home-based for appropriate patients. CPT code billing implications.", relevanceScore: 7, tags: ["NPWT", "wound care", "home health", "medical device"], agentGenerated: true, verified: false, source: "Knowledge Updater", createdAt: "2026-03-20T06:00:00Z" },

  // Specialty Pharma entries
  { id: "kb-14", vertical: "specialty_pharma", category: "market_trend", title: "340B Program: Contract Pharmacy Restrictions Tighten Under New HRSA Guidance", summary: "HRSA issued new ADR requiring covered entities to report contract pharmacy utilization monthly. Several manufacturers (Lilly, Novo) expanding restrictions. Impact on specialty practices using 340B for biologics.", relevanceScore: 9, tags: ["340B", "HRSA", "contract pharmacy", "specialty pharma"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-22T06:00:00Z" },
  { id: "kb-15", vertical: "specialty_pharma", category: "funding", title: "PAN Foundation RA Fund Reopened — $4.2M Available", summary: "Patient Access Network Foundation reopened the Rheumatoid Arthritis fund with $4.2M available. Eligibility: Medicare patients with income below 500% FPL. This directly impacts our copay assistance matching engine.", relevanceScore: 10, tags: ["PAN Foundation", "copay assistance", "RA", "Medicare"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-23T06:00:00Z" },

  // Digital Health entries
  { id: "kb-16", vertical: "digital_health", category: "funding", title: "Remote Patient Monitoring Market: $2.8B Raised in 2025", summary: "RPM sector attracted $2.8B in venture funding in 2025. Top areas: chronic disease management (RA, diabetes, CHF), post-surgical monitoring, and behavioral health. Content opportunity for RPM vendors targeting specialty practices.", relevanceScore: 7, tags: ["RPM", "funding", "chronic disease", "digital health"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-21T06:00:00Z" },
  { id: "kb-17", vertical: "digital_health", category: "product_launch", title: "Amwell Launches Specialty Telehealth for Rheumatology", summary: "Amwell expanded specialty telehealth modules to include rheumatology. Integrates with Epic and supports biologic infusion scheduling. Direct competitor to in-house telehealth at rheumatology practices.", relevanceScore: 8, tags: ["Amwell", "telehealth", "rheumatology", "Epic"], agentGenerated: true, verified: false, source: "Knowledge Updater", createdAt: "2026-03-20T06:00:00Z" },
  { id: "kb-18", vertical: "healthcare_it", category: "market_trend", title: "Healthcare AI Governance Frameworks: Joint Commission New Standards", summary: "Joint Commission announced AI governance standards effective July 2026. Health systems must document AI algorithm validation, bias testing, and clinical workflow integration for any AI tool used in care delivery.", relevanceScore: 8, tags: ["AI governance", "Joint Commission", "compliance", "healthcare AI"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-18T06:00:00Z" },
  { id: "kb-19", vertical: "rheumatology", category: "clinical_research", title: "Rinvoq (upadacitinib) Head-to-Head vs Humira: SELECT-COMPARE 3-Year Extension", summary: "3-year extension data from SELECT-COMPARE confirms upadacitinib superiority to adalimumab in ACR50 response (67% vs 52%). But CV safety monitoring still required per FDA label. Content angle: help practices navigate the efficacy-vs-safety conversation.", relevanceScore: 9, tags: ["Rinvoq", "upadacitinib", "Humira", "adalimumab", "clinical trial"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-17T06:00:00Z" },
  { id: "kb-20", vertical: "wound_care", category: "patient_insight", title: "Chronic Wound Patients: 73% Report Inadequate Education on Self-Management", summary: "Survey of 1,800 chronic wound patients reveals 73% feel they received inadequate education on wound self-management. Highest gap in autoimmune-related wounds. DTC content opportunity for wound care practices.", relevanceScore: 8, tags: ["patient education", "chronic wounds", "DTC", "self-management"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-16T06:00:00Z" },
  { id: "kb-21", vertical: "rheumatology", category: "market_trend", title: "IL-17 Inhibitors Gaining PsA Market Share as JAK Concerns Persist", summary: "Cosentyx (secukinumab) and Taltz (ixekizumab) combined market share in PsA grew to 34% in Q4 2025, up from 28% a year prior. Driven by rheumatologist preference shift away from JAK inhibitors for PsA.", relevanceScore: 8, tags: ["IL-17", "Cosentyx", "Taltz", "PsA", "market share"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-15T06:00:00Z" },
  { id: "kb-22", vertical: "healthcare_it", category: "competitor_intel", title: "Athenahealth Launches AI-Powered Prior Auth Module", summary: "Athenahealth released an integrated prior authorization module using AI to auto-populate clinical data for PA requests. Claims 70% reduction in PA completion time. Direct threat to standalone prior auth automation vendors.", relevanceScore: 8, tags: ["athenahealth", "prior auth", "AI", "EHR integration"], agentGenerated: true, verified: false, source: "Knowledge Updater", createdAt: "2026-03-14T06:00:00Z" },
  { id: "kb-23", vertical: "specialty_pharma", category: "regulation", title: "IRA Negotiation: First 10 Medicare Drugs Include 2 Rheumatology Products", summary: "CMS published negotiated prices for the first 10 drugs under the Inflation Reduction Act. Enbrel and Xeljanz both included. Prices take effect January 2027. Impact on specialty practice revenue models significant.", relevanceScore: 9, tags: ["IRA", "drug pricing", "Medicare", "Enbrel", "Xeljanz"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-13T06:00:00Z" },
  { id: "kb-24", vertical: "digital_health", category: "market_trend", title: "Patient Portal Engagement Hits 65% for Specialty Practices with Mobile-First Design", summary: "KLAS data shows specialty practices with mobile-first patient portals achieve 65% patient engagement vs 28% for desktop-only. Rheumatology practices with patient portals report 40% fewer no-shows.", relevanceScore: 7, tags: ["patient portal", "mobile", "engagement", "rheumatology"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-12T06:00:00Z" },
  { id: "kb-25", vertical: "rheumatology", category: "patient_insight", title: "DTC Biologic Advertising: Patient Perception Study", summary: "Study of 3,200 rheumatology patients: 41% asked their doctor about a specific biologic they saw advertised. But 78% of those patients were not candidates for that specific drug. Content opportunity: unbiased medication comparison guides.", relevanceScore: 8, tags: ["DTC", "advertising", "biologics", "patient education"], agentGenerated: true, verified: true, source: "Knowledge Updater", createdAt: "2026-03-11T06:00:00Z" },
];

// ─── Getter Functions ─────────────────────────────────────────────────────────

export function getDashboardStats(): DashboardStats {
  const totalRevenue = mockClients.reduce((sum, c) => sum + c.totalRevenue, 0) + 3000; // include some one-off revenue
  const activeClients = mockClients.filter(c => c.status === "active").length;
  const pipelineValue = mockProspects
    .filter(p => !["closed_won", "closed_lost"].includes(p.stage))
    .reduce((sum, p) => sum + p.estimatedMonthlySpend * 12, 0);
  const licensingPipelineValue = mockLicensingProspects
    .filter(lp => !["closed_won", "closed_lost"].includes(lp.stage))
    .reduce((sum, lp) => sum + lp.dealValue, 0);
  const agentRuns = mockAgentRuns.reduce((sum, a) => sum + a.runHistory.length, 0);
  const reviewQueuePending = mockReviewQueue.filter(r => r.status === "pending").length;
  const completedMilestones = mockMilestones.filter(m => m.status === "completed").length;
  const milestoneProgress = Math.round((completedMilestones / mockMilestones.length) * 100);

  return { totalRevenue, activeClients, pipelineValue, licensingPipelineValue, agentRuns, reviewQueuePending, milestoneProgress };
}

export function getRevenueEntries(): RevenueEntry[] {
  return [...mockRevenueEntries];
}

export function getAgentRuns(): AgentRun[] {
  return [...mockAgentRuns];
}

export function getReviewQueue(): ReviewQueueItem[] {
  return [...mockReviewQueue];
}

export function getMilestones(): ExecutionMilestone[] {
  return [...mockMilestones];
}

export function getProspects(): Prospect[] {
  return [...mockProspects];
}

export function updateProspect(id: string, updates: Partial<Prospect>): Prospect | null {
  const idx = mockProspects.findIndex(p => p.id === id);
  if (idx === -1) return null;
  Object.assign(mockProspects[idx], updates);
  return { ...mockProspects[idx] };
}

export function getClients(): Client[] {
  return [...mockClients];
}

export function updateClient(id: string, updates: Partial<Client>): Client | null {
  const idx = mockClients.findIndex(c => c.id === id);
  if (idx === -1) return null;
  Object.assign(mockClients[idx], updates);
  return { ...mockClients[idx] };
}

export function getLicensingProspects(): LicensingProspect[] {
  return [...mockLicensingProspects];
}

export function updateLicensingProspect(id: string, updates: Partial<LicensingProspect>): LicensingProspect | null {
  const idx = mockLicensingProspects.findIndex(lp => lp.id === id);
  if (idx === -1) return null;
  Object.assign(mockLicensingProspects[idx], updates);
  return { ...mockLicensingProspects[idx] };
}

export function updateMilestone(id: string, updates: Partial<ExecutionMilestone>): ExecutionMilestone | null {
  const idx = mockMilestones.findIndex(m => m.id === id);
  if (idx === -1) return null;
  Object.assign(mockMilestones[idx], updates);
  return { ...mockMilestones[idx] };
}

export function updateReviewItem(id: string, updates: Partial<ReviewQueueItem>): ReviewQueueItem | null {
  const idx = mockReviewQueue.findIndex(r => r.id === id);
  if (idx === -1) return null;
  Object.assign(mockReviewQueue[idx], updates);
  return { ...mockReviewQueue[idx] };
}

export function addRevenueEntry(entry: Partial<RevenueEntry>): RevenueEntry {
  const newEntry: RevenueEntry = {
    date: entry.date || new Date().toISOString().split("T")[0],
    amount: entry.amount || 0,
    source: entry.source || "consulting",
  };
  mockRevenueEntries.push(newEntry);
  return { ...newEntry };
}

export function addAgentRun(data: Partial<AgentRun>): AgentRun {
  const newRun: AgentRun = {
    id: `agent-${Date.now()}`,
    agentName: data.agentName || "New Agent",
    agentType: data.agentType || "gtm_monitor",
    status: data.status || "idle",
    lastRunTime: new Date().toISOString(),
    itemsProcessed: 0,
    itemsPendingReview: 0,
    systemPromptPreview: data.systemPromptPreview || "",
    runHistory: [],
    ...data,
  };
  mockAgentRuns.push(newRun);
  return { ...newRun };
}

export function updateAgentRun(id: string, updates: Partial<AgentRun>): AgentRun | null {
  const idx = mockAgentRuns.findIndex(a => a.id === id);
  if (idx === -1) return null;
  Object.assign(mockAgentRuns[idx], updates);
  return { ...mockAgentRuns[idx] };
}

export function addProspect(data: Partial<Prospect>): Prospect {
  const newProspect: Prospect = {
    id: `p-${Date.now()}`,
    companyName: data.companyName || "",
    contactName: data.contactName || "",
    contactTitle: data.contactTitle || "",
    email: data.email || "",
    vertical: data.vertical || "",
    stage: data.stage || "identified",
    switchingIntentScore: data.switchingIntentScore || 5,
    estimatedMonthlySpend: data.estimatedMonthlySpend || 0,
    daysInStage: 0,
    sourceAgent: data.sourceAgent || "manual",
    notes: data.notes || "",
    lastActivity: new Date().toISOString().split("T")[0],
    ...data,
  };
  mockProspects.push(newProspect);
  return { ...newProspect };
}

export function addClient(data: Partial<Client>): Client {
  const newClient: Client = {
    id: `c-${Date.now()}`,
    companyName: data.companyName || "",
    contactName: data.contactName || "",
    contactTitle: data.contactTitle || "",
    email: data.email || "",
    vertical: data.vertical || "",
    packageTier: data.packageTier || "starter",
    monthlyRate: data.monthlyRate || 0,
    deliverablesCompleted: 0,
    deliverablesTotal: 12,
    totalRevenue: 0,
    satisfaction: 0,
    status: "active",
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
    timeline: [],
    ...data,
  };
  mockClients.push(newClient);
  return { ...newClient };
}

export function addLicensingProspect(data: Partial<LicensingProspect>): LicensingProspect {
  const newProspect: LicensingProspect = {
    id: `lp-${Date.now()}`,
    name: data.name || "",
    title: data.title || "",
    company: data.company || "",
    followers: data.followers || 0,
    tierInterest: data.tierInterest || "operator",
    stage: data.stage || "identified",
    dealValue: data.dealValue || 8500,
    nextAction: data.nextAction || "",
    notes: data.notes || "",
    ...data,
  };
  mockLicensingProspects.push(newProspect);
  return { ...newProspect };
}

export function getKnowledgeBase(): KnowledgeBaseEntry[] {
  return [...mockKnowledgeBase];
}

export function addKBEntry(data: Partial<KnowledgeBaseEntry>): KnowledgeBaseEntry {
  const newEntry: KnowledgeBaseEntry = {
    id: `kb-${Date.now()}`,
    vertical: data.vertical || "",
    category: data.category || "",
    title: data.title || "",
    summary: data.summary || "",
    relevanceScore: data.relevanceScore || 5,
    tags: data.tags || [],
    agentGenerated: data.agentGenerated ?? true,
    verified: data.verified ?? false,
    source: data.source || "manual",
    createdAt: new Date().toISOString(),
    ...data,
  };
  mockKnowledgeBase.push(newEntry);
  return { ...newEntry };
}
