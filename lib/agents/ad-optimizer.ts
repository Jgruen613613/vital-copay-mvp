// Agent 2: Ad Campaign Optimizer
// Analyzes Meta/Google ad performance, generates variants, recommends budget allocation

import type { AdCampaign, AdVariant, AgentRun, ContentQueueItem } from './types';

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3600000).toISOString();
}

const CAMPAIGNS: AdCampaign[] = [
  {
    id: 1,
    campaign_name: 'RA Copay Relief',
    platform: 'meta',
    status: 'active',
    daily_budget: 75,
    impressions: 18420,
    clicks: 412,
    leads: 23,
    cpl: 3.26,
    ctr: 2.24,
    conversion_rate: 5.58,
    spend_today: 68.42,
    spend_total: 2248.50,
    best_performing_ad: 'Still paying $400/month for your RA medication? Most patients qualify for $0 copay.',
    audience_segment: 'RA patients 35-65, interest in rheumatology + prescription assistance',
  },
  {
    id: 2,
    campaign_name: 'Tracker Awareness',
    platform: 'meta',
    status: 'active',
    daily_budget: 50,
    impressions: 12890,
    clicks: 198,
    leads: 8,
    cpl: 6.25,
    ctr: 1.54,
    conversion_rate: 4.04,
    spend_today: 44.18,
    spend_total: 1560.25,
    best_performing_ad: 'Track your RA symptoms, prepare for doctor visits, and never miss medication again.',
    audience_segment: 'Autoimmune patients 25-55, interest in health tracking + chronic illness management',
  },
  {
    id: 3,
    campaign_name: 'Retargeting - Site Visitors',
    platform: 'meta',
    status: 'active',
    daily_budget: 30,
    impressions: 4210,
    clicks: 186,
    leads: 14,
    cpl: 2.14,
    ctr: 4.42,
    conversion_rate: 7.53,
    spend_today: 28.90,
    spend_total: 892.40,
    best_performing_ad: 'You checked your savings — now let a specialist handle the paperwork. Free.',
    audience_segment: 'Website visitors who completed savings checker but did not submit contact form',
  },
  {
    id: 4,
    campaign_name: 'Lookalike - Patient List',
    platform: 'meta',
    status: 'active',
    daily_budget: 40,
    impressions: 9750,
    clicks: 156,
    leads: 6,
    cpl: 6.67,
    ctr: 1.60,
    conversion_rate: 3.85,
    spend_today: 36.80,
    spend_total: 1104.00,
    best_performing_ad: 'Your specialty medication could cost $0. Check in 30 seconds.',
    audience_segment: '1% lookalike of converted patients, US only, 30-65',
  },
];

const AD_VARIANTS_POOL: AdVariant[][] = [
  // Variants for RA Copay Relief
  [
    {
      id: 101,
      headline: '$0 Copay on Your RA Medication',
      body: 'Insurance tier change got you paying $400/month? 90% of patients qualify for manufacturer copay assistance. Check in 30 seconds — no account needed.',
      cta: 'Check My Savings',
      target_audience: 'RA patients experiencing copay shock',
      rationale: 'Leads with the $0 outcome. Addresses the specific pain point of insurance tier changes that trigger most searches.',
    },
    {
      id: 102,
      headline: 'Your Doctor Forgot to Mention This',
      body: "97% of specialty medication patients miss savings programs that could eliminate their copay. Your rheumatologist doesn't have time to track them — but we do.",
      cta: 'Find My Programs',
      target_audience: 'RA patients who trust their doctor but feel underserved on cost',
      rationale: 'Creates curiosity gap without being misleading. Positions VITAL as the missing piece between the doctor and the patient.',
    },
    {
      id: 103,
      headline: 'Humira Copay Over $100? That Ends Today.',
      body: 'AbbVie, Pfizer, and private foundations offer copay assistance most patients never hear about. A VITAL specialist finds and enrolls you — free.',
      cta: 'Get Started Free',
      target_audience: 'Humira patients with high copays on commercial insurance',
      rationale: 'Medication-specific hook. Names real manufacturers to build credibility. Emphasizes the free nature of the service.',
    },
  ],
  // Variants for Tracker Awareness
  [
    {
      id: 201,
      headline: 'Show Your Rheumatologist Exactly What Happened',
      body: 'Log symptoms in seconds. Get AI-powered visit prep summaries. Walk into your next appointment with data, not just memories.',
      cta: 'Start Tracking Free',
      target_audience: 'RA patients frustrated by short appointment times',
      rationale: 'Addresses the common pain of forgetting symptoms at appointments. Positions the tracker as an advocacy tool.',
    },
    {
      id: 202,
      headline: 'Is Your RA Getting Worse? Know for Sure.',
      body: 'Track pain, stiffness, and fatigue daily. Our AI spots trends your memory misses and alerts you before flares hit.',
      cta: 'Try Free Tracker',
      target_audience: 'Newly diagnosed RA patients seeking control',
      rationale: 'Fear-based but empowering. The tracker gives patients certainty they lack.',
    },
    {
      id: 203,
      headline: 'Tired of Guessing How You Feel?',
      body: "RA symptoms shift daily. Stop guessing, start tracking. 30-second daily logs that turn into actionable insights for you and your doctor.",
      cta: 'Log Your First Day',
      target_audience: 'Chronic illness patients interested in quantified health',
      rationale: 'Low commitment CTA. Focuses on the frustration of symptom variability.',
    },
  ],
];

interface BudgetRecommendation {
  campaign_id: number;
  campaign_name: string;
  current_budget: number;
  recommended_budget: number;
  change_pct: number;
  reason: string;
}

/**
 * Run the ad optimizer agent.
 */
export function runAdOptimizer(): {
  run: AgentRun;
  campaigns: AdCampaign[];
  recommendations: BudgetRecommendation[];
  contentItems: ContentQueueItem[];
} {
  const campaigns = [...CAMPAIGNS];
  const recommendations = getRecommendations();

  // Generate ad variants for the best performing campaign
  const bestCampaign = campaigns.reduce((best, c) =>
    c.conversion_rate > best.conversion_rate ? c : best
  );
  const variants = generateAdVariants(bestCampaign);

  const contentItems: ContentQueueItem[] = variants.map((v, i) => ({
    id: 200 + i,
    agent_id: 2,
    content_type: 'ad_variant',
    title: v.headline,
    content: `${v.headline}\n\n${v.body}\n\nCTA: ${v.cta}`,
    metadata: {
      target_audience: v.target_audience,
      rationale: v.rationale,
      based_on_campaign: bestCampaign.campaign_name,
    },
    priority: 'high' as const,
    status: 'pending_review' as const,
    created_at: new Date().toISOString(),
  }));

  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend_today, 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0);
  const avgCpl = totalSpend / totalLeads;

  const run: AgentRun = {
    id: Date.now(),
    agent_id: 2,
    started_at: hoursAgo(1),
    completed_at: new Date().toISOString(),
    status: 'success',
    items_processed: campaigns.length,
    items_flagged: recommendations.length,
    summary: `Analyzed ${campaigns.length} active campaigns. Total spend today: $${totalSpend.toFixed(2)}. Total leads: ${totalLeads}. Avg CPL: $${avgCpl.toFixed(2)}. Generated ${variants.length} new ad variants. ${recommendations.length} budget recommendations.`,
    output: {
      total_spend_today: totalSpend,
      total_leads_today: totalLeads,
      avg_cpl: avgCpl,
      best_campaign: bestCampaign.campaign_name,
      best_cpl: bestCampaign.cpl,
      variants_generated: variants.length,
    },
    human_review_needed: true,
  };

  return { run, campaigns, recommendations, contentItems };
}

/**
 * Generate 3 new ad copy variants based on a winning campaign's style.
 */
export function generateAdVariants(winningCampaign: AdCampaign): AdVariant[] {
  const campaignIndex = CAMPAIGNS.findIndex((c) => c.id === winningCampaign.id);
  if (campaignIndex >= 0 && campaignIndex < AD_VARIANTS_POOL.length) {
    return AD_VARIANTS_POOL[campaignIndex];
  }
  // Default variants
  return AD_VARIANTS_POOL[0];
}

/**
 * Get budget reallocation recommendations.
 */
export function getRecommendations(): BudgetRecommendation[] {
  return [
    {
      campaign_id: 3,
      campaign_name: 'Retargeting - Site Visitors',
      current_budget: 30,
      recommended_budget: 50,
      change_pct: 66.7,
      reason: 'Highest conversion rate (7.53%) and lowest CPL ($2.14). Increase budget to capture more retargeting opportunity before audience saturation.',
    },
    {
      campaign_id: 1,
      campaign_name: 'RA Copay Relief',
      current_budget: 75,
      recommended_budget: 85,
      change_pct: 13.3,
      reason: 'Strong CPL ($3.26) and high volume. Modest increase to test if performance holds at higher spend.',
    },
    {
      campaign_id: 4,
      campaign_name: 'Lookalike - Patient List',
      current_budget: 40,
      recommended_budget: 25,
      change_pct: -37.5,
      reason: 'Highest CPL ($6.67) and lowest conversion rate (3.85%). Reduce budget and test new audience segments before scaling.',
    },
    {
      campaign_id: 2,
      campaign_name: 'Tracker Awareness',
      current_budget: 50,
      recommended_budget: 40,
      change_pct: -20,
      reason: 'Below-average CPL ($6.25). Test new creative variants before maintaining spend. Consider shifting $10 to Retargeting.',
    },
  ];
}

/**
 * Get all campaigns (for display).
 */
export function getCampaigns(): AdCampaign[] {
  return [...CAMPAIGNS];
}

/**
 * Get aggregate daily metrics.
 */
export function getDailyMetrics(): {
  total_spend: number;
  total_leads: number;
  total_clicks: number;
  total_impressions: number;
  avg_cpl: number;
  avg_ctr: number;
  avg_conversion_rate: number;
} {
  const total_spend = CAMPAIGNS.reduce((s, c) => s + c.spend_today, 0);
  const total_leads = CAMPAIGNS.reduce((s, c) => s + c.leads, 0);
  const total_clicks = CAMPAIGNS.reduce((s, c) => s + c.clicks, 0);
  const total_impressions = CAMPAIGNS.reduce((s, c) => s + c.impressions, 0);
  return {
    total_spend,
    total_leads,
    total_clicks,
    total_impressions,
    avg_cpl: total_spend / total_leads,
    avg_ctr: (total_clicks / total_impressions) * 100,
    avg_conversion_rate: (total_leads / total_clicks) * 100,
  };
}
