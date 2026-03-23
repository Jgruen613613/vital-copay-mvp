import { NextRequest, NextResponse } from "next/server";

// Agent definitions matching the database seed
const agents = [
  {
    id: 1,
    agent_name: "Community Monitor",
    agent_type: "community_monitor",
    description: "Scans patient communities every 2 hours for biologic affordability posts, pharmacy complaints, and copay discussions.",
    schedule: "every_2h",
    is_active: true,
    last_run_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    last_run_status: "success",
    last_run_summary: "Scanned 6 platforms. Found 8 relevant posts. 3 flagged as urgent. 5 response drafts generated.",
    total_runs: 156,
    total_items_processed: 1247,
  },
  {
    id: 2,
    agent_name: "Ad Optimizer",
    agent_type: "ad_optimizer",
    description: "Daily analysis of Meta/Google campaign performance. Identifies winning creatives and recommends budget reallocation.",
    schedule: "daily",
    is_active: true,
    last_run_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    last_run_status: "success",
    last_run_summary: "Analyzed 4 campaigns. CPL improved 12% week-over-week. Paused 2 underperforming creatives. Generated 3 new variants.",
    total_runs: 23,
    total_items_processed: 92,
  },
  {
    id: 3,
    agent_name: "Tracker Analysis Engine",
    agent_type: "tracker_analysis",
    description: "Real-time analysis of patient symptom logs. Generates weekly summaries, flare alerts, and visit prep documents.",
    schedule: "realtime",
    is_active: true,
    last_run_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    last_run_status: "success",
    last_run_summary: "Analyzed 47 patient logs. Generated 12 weekly summaries. Triggered 3 flare alerts. Prepared 2 visit documents.",
    total_runs: 892,
    total_items_processed: 4218,
  },
  {
    id: 4,
    agent_name: "Transfer Communications",
    agent_type: "transfer_communications",
    description: "Manages all patient communications throughout the prescription transfer lifecycle.",
    schedule: "realtime",
    is_active: true,
    last_run_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    last_run_status: "success",
    last_run_summary: "Sent 5 status updates. 2 transfers advanced to PA stage. 1 exception flagged for human review.",
    total_runs: 341,
    total_items_processed: 1589,
  },
  {
    id: 5,
    agent_name: "Rheumatologist Outreach",
    agent_type: "rheumatologist_outreach",
    description: "Weekly batch outreach to rheumatology practices. Personalized emails with 3-touch follow-up sequences.",
    schedule: "weekly",
    is_active: true,
    last_run_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_run_status: "success",
    last_run_summary: "Sent batch of 150 outreach emails. 23 opened (15.3%). 8 clicked through. 2 replied with interest.",
    total_runs: 8,
    total_items_processed: 1200,
  },
  {
    id: 6,
    agent_name: "Content Producer",
    agent_type: "content_producer",
    description: "Produces articles, FAQs, social content, and video scripts 3x/week from community questions and keyword gaps.",
    schedule: "3x_weekly",
    is_active: true,
    last_run_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    last_run_status: "success",
    last_run_summary: "Produced 2 articles (1,800 and 2,200 words), 5 social posts, 3 FAQs. All pending review.",
    total_runs: 34,
    total_items_processed: 278,
  },
];

const recentRuns = [
  { id: 1, agent_id: 1, agent_name: "Community Monitor", started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: "success", items_processed: 8, items_flagged: 3, summary: "Found 3 urgent affordability posts in r/rheumatoid and r/lupus" },
  { id: 2, agent_id: 4, agent_name: "Transfer Communications", started_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), status: "success", items_processed: 5, items_flagged: 1, summary: "Sent PA update to sarah.m@example.com. Flagged jenny.k transfer for review." },
  { id: 3, agent_id: 3, agent_name: "Tracker Analysis Engine", started_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), status: "success", items_processed: 12, items_flagged: 3, summary: "Generated flare alert for 3 patients with escalating symptoms" },
  { id: 4, agent_id: 6, agent_name: "Content Producer", started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), status: "success", items_processed: 10, items_flagged: 0, summary: "Drafted 2 articles and 5 social posts. All pending review." },
  { id: 5, agent_id: 2, agent_name: "Ad Optimizer", started_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), status: "success", items_processed: 4, items_flagged: 2, summary: "Paused 2 underperforming creatives. CPL down to $12.40 average." },
  { id: 6, agent_id: 5, agent_name: "Rheumatologist Outreach", started_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: "success", items_processed: 150, items_flagged: 2, summary: "Weekly batch: 150 emails sent. 2 practices responded with interest." },
];

const contentQueue = [
  { id: 1, agent_id: 1, content_type: "community_response", title: "Response to r/rheumatoid: Insurance dropped Humira coverage", content: "I'm so sorry you're going through this — the sudden jump from $5 to $400/month is devastating and unfortunately more common than it should be.\n\nThere are a few options worth exploring immediately:\n\n1. AbbVie Complete (the manufacturer program) — even if your copay card stopped working with the insurance change, the program may have alternatives for your new plan type\n2. Patient Assistance Foundations (PAN Foundation, HealthWell) — these have funds specifically for RA patients\n3. Specialty pharmacies that bundle copay assistance — some can bring the cost back to $0 by stacking multiple programs\n\nThe key is acting quickly before your next refill is due. Would it help if I shared more details about any of these options?", metadata: { platform: "reddit", subreddit: "rheumatoid", post_url: "https://reddit.com/r/rheumatoid/example1", urgency: "critical" }, priority: "urgent", status: "pending_review", created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 2, agent_id: 1, content_type: "community_response", title: "Response to r/PsoriaticArthritis: Affordable Rinvoq alternatives", content: "Great question. Rinvoq's list price is steep but there are legitimate ways to bring the cost down significantly:\n\n- If you have commercial insurance, AbbVie's copay program can reduce your out-of-pocket to as low as $5/month\n- If you're on Medicare, the PAN Foundation has an open fund for JAK inhibitors right now\n- Some specialty pharmacies have programs that cover the remaining gap entirely\n\nThe \"alternative\" isn't necessarily a different drug — it might be the same drug through a different cost-coverage pathway. Happy to elaborate on any of these if helpful.", metadata: { platform: "reddit", subreddit: "PsoriaticArthritis", urgency: "high" }, priority: "high", status: "pending_review", created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 3, agent_id: 2, content_type: "ad_creative", title: "New Ad Variant: Financial Relief (Version D)", content: "Headline: Your biologic shouldn't cost $5,000/year\nPrimary text: 847 patients transferred their prescription to us last year. Average savings: $4,800. Not a coupon. Not a one-time discount. $0 copay, every fill, for as long as you're on the medication.\nCTA: Check if you qualify → \nAudience: RA Copay Relief — Financial Pain", metadata: { campaign: "RA Copay Relief", based_on: "Version B (top performer)", estimated_cpl: "$11.20" }, priority: "normal", status: "pending_review", created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString() },
  { id: 4, agent_id: 2, content_type: "ad_recommendation", title: "Budget Reallocation: Shift $500 from Tracker to Offer Page", content: "The Tracker Awareness campaign is running at $22.40 CPL while the RA Copay Relief campaign is at $12.40 CPL. Recommend shifting $500/week from Tracker to Offer Page campaigns until Tracker creative is optimized.\n\nExpected impact: +40 additional offer page leads/month at current CPL.", metadata: { current_tracker_cpl: "$22.40", current_offer_cpl: "$12.40", shift_amount: "$500/week" }, priority: "normal", status: "pending_review", created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString() },
  { id: 5, agent_id: 6, content_type: "article", title: "Why Your Biologic Costs $5,000/Year (And How to Pay $0)", content: "## Why Your Biologic Costs $5,000/Year (And How to Pay $0)\n\nIf you're on a biologic medication for rheumatoid arthritis, psoriatic arthritis, or another autoimmune condition, you already know the financial reality: these medications can cost $5,000 to $10,000 per year in out-of-pocket costs, even with insurance.\n\nBut here's what most patients don't know: there are programs — available right now — that can bring that cost to zero. Not $50. Not $100. Zero.\n\n### The Three Layers of Cost Coverage\n\n**Layer 1: Manufacturer Copay Programs**\nEvery major biologic manufacturer runs a copay assistance program...\n\n**Layer 2: Patient Assistance Foundations**\nOrganizations like the PAN Foundation, HealthWell Foundation, and Chronic Disease Fund...\n\n**Layer 3: Specialty Pharmacy Programs**\nSome specialty pharmacies have built systems that stack all available programs...\n\n### The Math\n- Average annual biologic cost with insurance: $6,800\n- After manufacturer copay card: $1,200\n- After foundation grant: $200\n- After pharmacy program: $0\n\n### Why Don't More Patients Know About This?\n...", metadata: { word_count: 1800, target_keywords: ["biologic cost", "copay assistance", "humira cost", "specialty pharmacy savings"], seo_difficulty: "medium" }, priority: "normal", status: "pending_review", created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: 6, agent_id: 6, content_type: "social_post", title: "Social: Morning stiffness stat (Instagram/Facebook)", content: "If your morning stiffness lasts more than 30 minutes, that's not normal aging. That's a clinical red flag your primary care doctor should hear about.\n\n30+ minutes of morning stiffness is one of the key diagnostic criteria for inflammatory arthritis.\n\nYou deserve answers, not dismissal.\n\n#RheumatoidArthritis #ChronicIllness #Autoimmune #RAWarrior", metadata: { platform: "instagram", format: "text_post", estimated_engagement: "high" }, priority: "low", status: "pending_review", created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: 7, agent_id: 5, content_type: "outreach_email", title: "Outreach Email 1: Dr. Martinez, Austin Rheumatology Associates", content: "Subject: Free symptom tracking tool for your RA patients\n\nDr. Martinez,\n\nI'm reaching out because we've built a free symptom tracking tool specifically for rheumatology patients, and I think your patients at Austin Rheumatology Associates might find it valuable.\n\nThe tool generates a structured 90-day symptom summary your patients can share before each visit — including joint involvement trends, morning stiffness patterns, medication adherence, and lab correlations.\n\nYour patients arrive better prepared. You spend less time on history-taking. You have objective trend data instead of subjective recall.\n\nIt's completely free for your patients and your practice. I've attached a sample of what your patients would bring to appointments.\n\nWould a 10-minute call to walk through the tool be useful?\n\nBest,\n[Clinician Name]\nVITAL Health Technologies", metadata: { practice_name: "Austin Rheumatology Associates", npi: "1234567890", provider: "Dr. Maria Martinez", city: "Austin", state: "TX", practice_type: "small_group", sequence_step: 1 }, priority: "normal", status: "pending_review", created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 8, agent_id: 3, content_type: "patient_alert", title: "Flare Alert: Patient #47 — Escalating symptoms (3 days)", content: "Patient #47 has shown a sharp symptom escalation over the last 3 days:\n- Pain score: 3 → 5 → 8 (today)\n- Morning stiffness: 15min → 45min → 90min\n- Affected joints: 2 → 4 → 7\n- Free text today: 'Woke up and could barely close my hands'\n\nThis pattern is consistent with an active flare. Next scheduled appointment: April 2 (10 days away).\n\nRecommendation: Prompt patient to contact provider before scheduled visit.", metadata: { patient_id: 47, urgency: "critical", days_to_appointment: 10 }, priority: "urgent", status: "pending_review", created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // agents, runs, content, metrics

  switch (type) {
    case "agents":
      return NextResponse.json(agents);
    case "runs":
      return NextResponse.json(recentRuns);
    case "content":
      const statusFilter = searchParams.get("status");
      const agentFilter = searchParams.get("agent_id");
      let filtered = [...contentQueue];
      if (statusFilter) filtered = filtered.filter(c => c.status === statusFilter);
      if (agentFilter) filtered = filtered.filter(c => c.agent_id === parseInt(agentFilter));
      return NextResponse.json(filtered);
    case "metrics":
      return NextResponse.json({
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
      });
    default:
      return NextResponse.json({ agents, metrics: { qualified_leads_this_month: 127 } });
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { content_id, action } = body;

  const item = contentQueue.find(c => c.id === content_id);
  if (!item) {
    return NextResponse.json({ error: "Content item not found" }, { status: 404 });
  }

  if (action === "approve") {
    item.status = "approved";
  } else if (action === "reject") {
    item.status = "rejected";
  } else if (action === "publish") {
    item.status = "published";
  }

  return NextResponse.json(item);
}
