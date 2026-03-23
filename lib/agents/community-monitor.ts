// Agent 1: Community Monitor
// Scans patient communities for people who need copay assistance
// Drafts empathetic, compliant responses

import type { FlaggedPost, AgentRun, ContentQueueItem } from './types';

const now = new Date();
function hoursAgo(n: number): string {
  return new Date(now.getTime() - n * 3600000).toISOString();
}
function minutesAgo(n: number): string {
  return new Date(now.getTime() - n * 60000).toISOString();
}

const FLAGGED_POSTS: FlaggedPost[] = [
  {
    id: 1,
    platform: 'reddit',
    community: 'r/rheumatoid',
    author: 'frustrated_RA_patient',
    title: 'My insurance just dropped Humira coverage, copay went from $5 to $400/month',
    excerpt: 'Been on Humira for 3 years and it\'s been life-changing. Just got a letter saying my plan is moving it to a higher tier. I can\'t afford $400/month. Has anyone dealt with this? I\'m terrified of having to stop.',
    url: 'https://reddit.com/r/rheumatoid/comments/mock1',
    topic_tags: ['insurance_change', 'humira', 'copay_shock', 'access_barrier'],
    relevance_score: 0.97,
    urgency: 'critical',
    conversion_potential: 'high',
    detected_at: minutesAgo(23),
    response_draft: null,
  },
  {
    id: 2,
    platform: 'reddit',
    community: 'r/PsoriaticArthritis',
    author: 'psa_warrior_2024',
    title: 'Has anyone found an affordable alternative to Rinvoq?',
    excerpt: 'My rheumatologist put me on Rinvoq and it works great but my copay is $250/month even with insurance. I\'m a teacher and this is eating my budget. Are there any patient assistance programs I should know about?',
    url: 'https://reddit.com/r/PsoriaticArthritis/comments/mock2',
    topic_tags: ['rinvoq', 'cost_concern', 'copay_assistance', 'direct_ask'],
    relevance_score: 0.95,
    urgency: 'high',
    conversion_potential: 'high',
    detected_at: minutesAgo(47),
    response_draft: null,
  },
  {
    id: 3,
    platform: 'reddit',
    community: 'r/rheumatoid',
    author: 'newly_diagnosed_RA',
    title: 'Switching from Enbrel to biosimilar - terrified',
    excerpt: 'My insurance is forcing a switch to Hadlima. My doctor says it should be equivalent but I\'ve been stable on Enbrel for 2 years. Has anyone made this switch? I\'m scared of flaring.',
    url: 'https://reddit.com/r/rheumatoid/comments/mock3',
    topic_tags: ['biosimilar_switch', 'enbrel', 'fear', 'insurance_mandate'],
    relevance_score: 0.89,
    urgency: 'medium',
    conversion_potential: 'medium',
    detected_at: hoursAgo(2),
    response_draft: null,
  },
  {
    id: 4,
    platform: 'facebook',
    community: 'Rheumatoid Arthritis Support Group',
    author: 'Linda M.',
    title: 'Medicare donut hole and my Stelara costs',
    excerpt: 'Just hit the coverage gap on my Medicare Part D and now my Stelara injection is going to cost me over $3000 this month. I\'m on a fixed income. Does anyone know if there are foundations that help with this?',
    url: 'https://facebook.com/groups/ra-support/posts/mock4',
    topic_tags: ['medicare', 'stelara', 'donut_hole', 'foundation_assistance', 'fixed_income'],
    relevance_score: 0.94,
    urgency: 'critical',
    conversion_potential: 'high',
    detected_at: hoursAgo(1),
    response_draft: null,
  },
  {
    id: 5,
    platform: 'inspire',
    community: 'Ankylosing Spondylitis Community',
    author: 'AS_fighter_TX',
    title: 'Cosentyx copay card expiring - what are my options?',
    excerpt: 'My Novartis copay card is about to expire and I\'m dreading what my out-of-pocket is going to be. Has anyone successfully renewed theirs or found another program? My insurance is through my employer.',
    url: 'https://inspire.com/groups/as/discussion/mock5',
    topic_tags: ['cosentyx', 'copay_card_renewal', 'commercial_insurance'],
    relevance_score: 0.91,
    urgency: 'high',
    conversion_potential: 'high',
    detected_at: hoursAgo(3),
    response_draft: null,
  },
  {
    id: 6,
    platform: 'reddit',
    community: 'r/CrohnsDisease',
    author: 'crohns_and_coffee',
    title: 'Just got denied for Remicade infusion - prior auth rejected',
    excerpt: 'I\'ve been on Remicade for 5 years. New insurance company denied my prior auth saying I need to try and fail on a biosimilar first. My GI is furious. Anyone dealt with step therapy requirements?',
    url: 'https://reddit.com/r/CrohnsDisease/comments/mock6',
    topic_tags: ['remicade', 'prior_auth_denial', 'step_therapy', 'appeal'],
    relevance_score: 0.88,
    urgency: 'high',
    conversion_potential: 'medium',
    detected_at: hoursAgo(4),
    response_draft: null,
  },
  {
    id: 7,
    platform: 'myra_team',
    community: 'General Discussion',
    author: 'hopeful_patient',
    title: 'Starting Xeljanz next week - any tips on managing costs?',
    excerpt: 'My rheumatologist just prescribed Xeljanz. I looked up the price and almost fainted. $5,000/month retail? Even with my insurance the copay is going to be significant. Any advice?',
    url: 'https://myra.team/discussions/mock7',
    topic_tags: ['xeljanz', 'new_start', 'cost_concern', 'proactive'],
    relevance_score: 0.86,
    urgency: 'medium',
    conversion_potential: 'high',
    detected_at: hoursAgo(5),
    response_draft: null,
  },
  {
    id: 8,
    platform: 'facebook',
    community: 'Psoriatic Arthritis Warriors',
    author: 'Dave K.',
    title: 'Skyrizi working amazing but worried about annual reset',
    excerpt: 'Skyrizi has been a miracle drug for me. But my copay card benefit resets in January and I have a $3000 deductible to meet again. Every year it\'s a financial shock in Q1. Is there a way to smooth this out?',
    url: 'https://facebook.com/groups/psa-warriors/posts/mock8',
    topic_tags: ['skyrizi', 'annual_reset', 'deductible', 'copay_card'],
    relevance_score: 0.84,
    urgency: 'medium',
    conversion_potential: 'medium',
    detected_at: hoursAgo(6),
    response_draft: null,
  },
  {
    id: 9,
    platform: 'reddit',
    community: 'r/UlcerativeColitis',
    author: 'uc_newbie_2025',
    title: 'Uninsured and just prescribed Entyvio - is there any hope?',
    excerpt: 'Lost my job and insurance last month. My GI says I need Entyvio infusions or risk hospitalization. The list price is insane. I feel completely hopeless. Are there programs for uninsured patients?',
    url: 'https://reddit.com/r/UlcerativeColitis/comments/mock9',
    topic_tags: ['entyvio', 'uninsured', 'pap', 'urgent_need', 'job_loss'],
    relevance_score: 0.96,
    urgency: 'critical',
    conversion_potential: 'high',
    detected_at: minutesAgo(35),
    response_draft: null,
  },
  {
    id: 10,
    platform: 'inspire',
    community: 'Lupus Support Network',
    author: 'lupus_life_42',
    title: 'Benlysta costs with dual coverage (Medicare + Medicaid)',
    excerpt: 'I have both Medicare and Medicaid. My doctor wants me on Benlysta but the specialty pharmacy quoted me $500/month even with dual coverage. That can\'t be right, can it? Does anyone have experience with this?',
    url: 'https://inspire.com/groups/lupus/discussion/mock10',
    topic_tags: ['benlysta', 'dual_eligible', 'billing_error', 'specialty_pharmacy'],
    relevance_score: 0.87,
    urgency: 'high',
    conversion_potential: 'high',
    detected_at: hoursAgo(7),
    response_draft: null,
  },
];

const RESPONSE_TEMPLATES: Record<string, string> = {
  copay_shock: `I'm really sorry you're dealing with this. A sudden copay increase can be incredibly stressful, especially when you depend on your medication.

There are actually several assistance programs that can help reduce or eliminate your copay, even with the tier change. Many patients don't know about these because they're managed separately from your insurance.

I'd suggest looking into manufacturer copay assistance and independent foundation grants — both can bring your cost back down to $0-$5 in many cases. Your doctor's office or a patient access specialist can help you navigate the options.

You should NOT have to choose between your health and your finances. Help exists.`,

  cost_concern: `Totally understand the sticker shock. The retail prices on specialty medications are genuinely alarming, but the good news is that most patients end up paying significantly less than the list price.

There are manufacturer copay cards, foundation assistance programs, and patient assistance programs that can help. For many commercially insured patients, these programs can bring the copay down to $0-$5/month.

I'd recommend reaching out to the manufacturer's patient support line or asking your rheumatologist's office about copay assistance. A medication access specialist can also help you find the right programs.`,

  biosimilar_switch: `This is a really common concern and totally valid. The transition can feel scary when you've been stable on something.

A few things that might help: biosimilars go through rigorous FDA testing and must demonstrate no clinically meaningful differences. Many patients switch successfully. That said, if you do experience any changes, your doctor can work with you.

One thing worth knowing — if you're worried about costs during or after the switch, there are copay assistance programs available for both branded biologics and biosimilars. A medication access specialist can help you understand all your options.`,

  foundation_assistance: `I'm sorry you're in this situation. Hitting the coverage gap on Medicare can be devastating for specialty medications.

Yes, there are foundations that specifically help patients in your situation. Independent foundations like PAN Foundation and HealthWell Foundation often have funds available for specific disease states. They can cover copays, premiums, and sometimes even the donut hole gap.

The key is applying quickly because some funds open and close throughout the year. A patient access specialist who monitors fund availability can help you get enrolled at the right time.`,

  uninsured: `I'm so sorry you're going through this, especially on top of losing your job. Please don't lose hope — there are real programs designed specifically for uninsured patients.

Most specialty medication manufacturers have Patient Assistance Programs (PAPs) that provide the medication at no cost for qualifying uninsured patients. Income thresholds are often more generous than you'd expect.

I'd strongly encourage you to contact the manufacturer's patient services line right away, or reach out to a medication access specialist who can fast-track your application. Given the urgency, many of these programs can approve within days, not weeks.`,
};

/**
 * Run the community monitor agent.
 * Returns a simulated agent run with flagged posts.
 */
export function runCommunityMonitor(): {
  run: AgentRun;
  flaggedPosts: FlaggedPost[];
  contentItems: ContentQueueItem[];
} {
  const flaggedPosts = [...FLAGGED_POSTS];
  const criticalCount = flaggedPosts.filter((p) => p.urgency === 'critical').length;
  const highCount = flaggedPosts.filter((p) => p.urgency === 'high').length;

  const contentItems: ContentQueueItem[] = flaggedPosts
    .filter((p) => p.urgency === 'critical' || p.urgency === 'high')
    .map((p, i) => ({
      id: 100 + i,
      agent_id: 1,
      content_type: 'community_response',
      title: `Response to: ${p.title.slice(0, 60)}...`,
      content: draftResponse(p),
      metadata: {
        platform: p.platform,
        community: p.community,
        post_url: p.url,
        urgency: p.urgency,
        relevance_score: p.relevance_score,
      },
      priority: p.urgency === 'critical' ? 'urgent' as const : 'high' as const,
      status: 'pending_review' as const,
      created_at: new Date().toISOString(),
    }));

  const run: AgentRun = {
    id: Date.now(),
    agent_id: 1,
    started_at: minutesAgo(5),
    completed_at: new Date().toISOString(),
    status: 'success',
    items_processed: flaggedPosts.length,
    items_flagged: flaggedPosts.length,
    summary: `Scanned 4 platforms, 12 communities. Found ${flaggedPosts.length} relevant posts (${criticalCount} critical, ${highCount} high priority). ${contentItems.length} response drafts generated for review.`,
    output: {
      platforms_scanned: ['reddit', 'facebook', 'inspire', 'myra_team'],
      communities_scanned: 12,
      posts_analyzed: 847,
      posts_flagged: flaggedPosts.length,
      critical_count: criticalCount,
      high_count: highCount,
    },
    human_review_needed: criticalCount > 0,
  };

  return { run, flaggedPosts, contentItems };
}

/**
 * Draft an empathetic, compliant response for a flagged post.
 */
export function draftResponse(post: FlaggedPost): string {
  // Determine which template to use based on tags
  if (post.topic_tags.includes('copay_shock') || post.topic_tags.includes('insurance_change')) {
    return RESPONSE_TEMPLATES.copay_shock;
  }
  if (post.topic_tags.includes('uninsured') || post.topic_tags.includes('pap')) {
    return RESPONSE_TEMPLATES.uninsured;
  }
  if (post.topic_tags.includes('biosimilar_switch')) {
    return RESPONSE_TEMPLATES.biosimilar_switch;
  }
  if (post.topic_tags.includes('foundation_assistance') || post.topic_tags.includes('medicare') || post.topic_tags.includes('donut_hole')) {
    return RESPONSE_TEMPLATES.foundation_assistance;
  }
  // Default to cost concern
  return RESPONSE_TEMPLATES.cost_concern;
}

/**
 * Get all flagged posts (for display in admin).
 */
export function getFlaggedPosts(): FlaggedPost[] {
  return [...FLAGGED_POSTS];
}

/**
 * Get posts filtered by urgency.
 */
export function getPostsByUrgency(urgency: FlaggedPost['urgency']): FlaggedPost[] {
  return FLAGGED_POSTS.filter((p) => p.urgency === urgency);
}

/**
 * Get platform breakdown stats.
 */
export function getPlatformStats(): Record<string, { posts: number; critical: number; high: number }> {
  const stats: Record<string, { posts: number; critical: number; high: number }> = {};
  for (const post of FLAGGED_POSTS) {
    if (!stats[post.platform]) {
      stats[post.platform] = { posts: 0, critical: 0, high: 0 };
    }
    stats[post.platform].posts++;
    if (post.urgency === 'critical') stats[post.platform].critical++;
    if (post.urgency === 'high') stats[post.platform].high++;
  }
  return stats;
}
