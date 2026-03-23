// Agent 5: Rheumatologist Outreach Engine
// Manages physician outreach campaigns to grow the VITAL Health referral network

import type { RheumatologyPractice, OutreachEmail, AgentRun, ContentQueueItem } from './types';

/* ─── Mock Practices ─── */
const PRACTICES: RheumatologyPractice[] = [
  {
    id: 1, npi: '1234567890', physician_name: 'Dr. Rebecca Chen',
    practice_name: 'North Texas Rheumatology', practice_type: 'group',
    city: 'Dallas', state: 'TX', patient_volume: 'high',
    outreach_status: 'not_contacted', conversion_score: 92,
    last_contacted_at: null, notes: null,
  },
  {
    id: 2, npi: '2345678901', physician_name: 'Dr. Michael Torres',
    practice_name: 'Pacific Rheumatology Associates', practice_type: 'group',
    city: 'Los Angeles', state: 'CA', patient_volume: 'high',
    outreach_status: 'sequence_1', conversion_score: 88,
    last_contacted_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    notes: 'Opened email. Clicked on sample PDF link.',
  },
  {
    id: 3, npi: '3456789012', physician_name: 'Dr. Sarah Williams',
    practice_name: 'Southeast Arthritis Center', practice_type: 'group',
    city: 'Atlanta', state: 'GA', patient_volume: 'high',
    outreach_status: 'sequence_2', conversion_score: 85,
    last_contacted_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    notes: 'Downloaded patient savings report. No reply yet.',
  },
  {
    id: 4, npi: '4567890123', physician_name: 'Dr. James Park',
    practice_name: 'Midwest Rheumatology Clinic', practice_type: 'solo',
    city: 'Chicago', state: 'IL', patient_volume: 'medium',
    outreach_status: 'responded', conversion_score: 95,
    last_contacted_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    notes: 'Replied interested. Wants to schedule a call for next week.',
  },
  {
    id: 5, npi: '5678901234', physician_name: 'Dr. Emily Rodriguez',
    practice_name: 'Columbia University Rheumatology', practice_type: 'academic',
    city: 'New York', state: 'NY', patient_volume: 'high',
    outreach_status: 'not_contacted', conversion_score: 78,
    last_contacted_at: null, notes: null,
  },
  {
    id: 6, npi: '6789012345', physician_name: 'Dr. David Kim',
    practice_name: 'Bay Area Autoimmune Specialists', practice_type: 'group',
    city: 'San Francisco', state: 'CA', patient_volume: 'medium',
    outreach_status: 'meeting_scheduled', conversion_score: 97,
    last_contacted_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: 'Meeting scheduled for Friday 2pm. Interested in copay assistance for Humira and Rinvoq patients.',
  },
  {
    id: 7, npi: '7890123456', physician_name: 'Dr. Lisa Patel',
    practice_name: 'Florida Arthritis & Rheumatology', practice_type: 'group',
    city: 'Miami', state: 'FL', patient_volume: 'high',
    outreach_status: 'sequence_1', conversion_score: 82,
    last_contacted_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    notes: 'Email delivered. Not opened yet.',
  },
  {
    id: 8, npi: '8901234567', physician_name: 'Dr. Robert Anderson',
    practice_name: 'Anderson Rheumatology PLLC', practice_type: 'solo',
    city: 'Phoenix', state: 'AZ', patient_volume: 'low',
    outreach_status: 'not_contacted', conversion_score: 71,
    last_contacted_at: null, notes: null,
  },
  {
    id: 9, npi: '9012345678', physician_name: 'Dr. Amanda Foster',
    practice_name: 'Penn Medicine Rheumatology', practice_type: 'academic',
    city: 'Philadelphia', state: 'PA', patient_volume: 'high',
    outreach_status: 'sequence_3', conversion_score: 74,
    last_contacted_at: new Date(Date.now() - 21 * 86400000).toISOString(),
    notes: 'No engagement on any of the 3 emails. May need different approach.',
  },
  {
    id: 10, npi: '0123456789', physician_name: 'Dr. Kevin Murphy',
    practice_name: 'Rocky Mountain Rheumatology', practice_type: 'group',
    city: 'Denver', state: 'CO', patient_volume: 'medium',
    outreach_status: 'partner', conversion_score: 99,
    last_contacted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: 'Active partner. 8 patients referred this month. Very engaged.',
  },
  {
    id: 11, npi: '1123456780', physician_name: 'Dr. Michelle Lee',
    practice_name: 'Houston Methodist Rheumatology', practice_type: 'hospital_based',
    city: 'Houston', state: 'TX', patient_volume: 'high',
    outreach_status: 'sequence_2', conversion_score: 80,
    last_contacted_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    notes: 'Opened both emails. Forwarded to practice manager.',
  },
  {
    id: 12, npi: '2234567891', physician_name: 'Dr. Christopher Brown',
    practice_name: 'Puget Sound Rheumatology', practice_type: 'group',
    city: 'Seattle', state: 'WA', patient_volume: 'medium',
    outreach_status: 'not_contacted', conversion_score: 83,
    last_contacted_at: null, notes: null,
  },
  {
    id: 13, npi: '3345678902', physician_name: 'Dr. Patricia Gonzalez',
    practice_name: 'Southwest Arthritis Associates', practice_type: 'group',
    city: 'San Antonio', state: 'TX', patient_volume: 'medium',
    outreach_status: 'responded', conversion_score: 90,
    last_contacted_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    notes: 'Replied asking for more info on the patient portal. Sent demo link.',
  },
  {
    id: 14, npi: '4456789013', physician_name: 'Dr. Brian Wilson',
    practice_name: 'Wilson Rheumatology', practice_type: 'solo',
    city: 'Nashville', state: 'TN', patient_volume: 'low',
    outreach_status: 'sequence_1', conversion_score: 68,
    last_contacted_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    notes: 'Email bounced. Need to verify contact info.',
  },
  {
    id: 15, npi: '5567890124', physician_name: 'Dr. Jennifer Chang',
    practice_name: 'Massachusetts General Rheumatology', practice_type: 'academic',
    city: 'Boston', state: 'MA', patient_volume: 'high',
    outreach_status: 'not_contacted', conversion_score: 76,
    last_contacted_at: null, notes: null,
  },
];

/* ─── Email Templates ─── */
function getEmailTemplate(practice: RheumatologyPractice, step: number): OutreachEmail {
  const templates: Record<number, OutreachEmail> = {
    1: {
      subject: `Helping your ${practice.practice_type === 'solo' ? '' : 'practice\'s '}RA patients access $0 copay programs`,
      body: `Dear ${practice.physician_name},

I'm reaching out from VITAL Health Technologies. We work with rheumatology practices to help patients access copay assistance programs for specialty medications like Humira, Enbrel, Rinvoq, and Xeljanz.

The challenge we keep hearing from practices like ${practice.practice_name}: patients start skipping doses or abandoning therapy when they hit a $200-$400/month copay wall. 97% of patients on specialty medications qualify for assistance programs that could reduce their copay to $0, but most don't know these programs exist.

VITAL handles the entire enrollment process at no cost to you or your patients:
• We identify all available copay assistance programs for each patient's medication
• We complete the applications and handle renewals
• We coordinate pharmacy transfers when beneficial
• Your patients stay on therapy and you see better outcomes

Would you have 15 minutes this week for a brief call? I'd love to share what we're seeing in ${practice.state} specifically.

Best regards,
VITAL Health Technologies`,
      sequence_step: 1,
      personalization_notes: `Personalized for ${practice.practice_type} practice in ${practice.city}, ${practice.state}. References practice name and state-specific data.`,
    },
    2: {
      subject: `Patient savings report for ${practice.practice_name}`,
      body: `${practice.physician_name},

Following up on my previous email. I put together a quick savings analysis based on publicly available prescribing data for ${practice.practice_name}.

Key findings:
• Estimated patients on specialty biologics: ${practice.patient_volume === 'high' ? '120-180' : practice.patient_volume === 'medium' ? '60-100' : '20-40'}
• Estimated patients currently overpaying: ${practice.patient_volume === 'high' ? '85-130' : practice.patient_volume === 'medium' ? '40-70' : '15-30'}
• Potential annual savings across your patient panel: ${practice.patient_volume === 'high' ? '$1.2M-$2.1M' : practice.patient_volume === 'medium' ? '$480K-$840K' : '$120K-$320K'}

I've attached a sample patient savings report (PDF) showing what we provide for each patient. It's a one-page summary your staff can share during visits.

The program is completely free for practices and patients. Would it be helpful if I sent you a few sample reports for your most commonly prescribed medications?

Best regards,
VITAL Health Technologies`,
      sequence_step: 2,
      personalization_notes: `Includes estimated patient volume data based on practice type (${practice.practice_type}) and volume (${practice.patient_volume}). Attached sample PDF.`,
    },
    3: {
      subject: `Last note — free resource for ${practice.practice_name} patients`,
      body: `${practice.physician_name},

I know your inbox is busy, so this will be my last email unless you'd like to hear more.

I wanted to leave you with a free resource regardless of whether we work together: a patient-facing handout listing the major copay assistance programs for RA medications. Your front desk or nursing staff can hand it to any patient who mentions cost concerns.

Download it here: [Patient Copay Guide PDF]

If you ever want to explore a more hands-on approach where we handle the enrollment for your patients, we're here. Many of our partner rheumatologists tell us it's reduced their abandonment rates by 40-60%.

Wishing you and your patients well.

Best regards,
VITAL Health Technologies`,
      sequence_step: 3,
      personalization_notes: `Final touchpoint. Low-pressure approach with a free resource. No response needed.`,
    },
  };

  return templates[step] || templates[1];
}

/* ─── Exported Functions ─── */

/**
 * Run a batch of outreach emails.
 */
export function runOutreachBatch(batchSize: number = 10): {
  run: AgentRun;
  emailsSent: { practice: RheumatologyPractice; email: OutreachEmail }[];
  contentItems: ContentQueueItem[];
} {
  // Find practices due for next outreach step
  const duePractices = PRACTICES.filter((p) => {
    if (p.outreach_status === 'not_contacted') return true;
    if (p.outreach_status === 'partner' || p.outreach_status === 'responded' || p.outreach_status === 'meeting_scheduled') return false;
    if (p.outreach_status === 'sequence_3') return false; // Already completed sequence
    // Check if enough time has passed since last contact
    if (p.last_contacted_at) {
      const daysSince = (Date.now() - new Date(p.last_contacted_at).getTime()) / 86400000;
      return daysSince >= 5;
    }
    return true;
  }).slice(0, batchSize);

  const emailsSent = duePractices.map((practice) => {
    const step = practice.outreach_status === 'not_contacted' ? 1
      : practice.outreach_status === 'sequence_1' ? 2
      : 3;
    const email = generateOutreachEmail(practice, step);
    return { practice, email };
  });

  const contentItems: ContentQueueItem[] = emailsSent.map((item, i) => ({
    id: 500 + i,
    agent_id: 5,
    content_type: 'outreach_email',
    title: `${item.email.subject} — ${item.practice.physician_name}`,
    content: item.email.body,
    metadata: {
      practice_id: item.practice.id,
      physician_name: item.practice.physician_name,
      practice_name: item.practice.practice_name,
      sequence_step: item.email.sequence_step,
      conversion_score: item.practice.conversion_score,
    },
    priority: item.practice.conversion_score >= 85 ? 'high' as const : 'normal' as const,
    status: 'pending_review' as const,
    created_at: new Date().toISOString(),
  }));

  const run: AgentRun = {
    id: Date.now(),
    agent_id: 5,
    started_at: new Date(Date.now() - 180000).toISOString(),
    completed_at: new Date().toISOString(),
    status: 'success',
    items_processed: duePractices.length,
    items_flagged: emailsSent.filter((e) => e.practice.conversion_score >= 85).length,
    summary: `Prepared ${emailsSent.length} outreach emails for review. ${emailsSent.filter((e) => e.email.sequence_step === 1).length} new introductions, ${emailsSent.filter((e) => e.email.sequence_step === 2).length} follow-ups, ${emailsSent.filter((e) => e.email.sequence_step === 3).length} final touchpoints. ${duePractices.filter((p) => p.conversion_score >= 85).length} high-priority targets.`,
    output: {
      emails_prepared: emailsSent.length,
      new_introductions: emailsSent.filter((e) => e.email.sequence_step === 1).length,
      follow_ups: emailsSent.filter((e) => e.email.sequence_step > 1).length,
      high_priority_targets: duePractices.filter((p) => p.conversion_score >= 85).length,
    },
    human_review_needed: true,
  };

  return { run, emailsSent, contentItems };
}

/**
 * Generate a personalized outreach email for a practice.
 */
export function generateOutreachEmail(practice: RheumatologyPractice, sequenceStep: number): OutreachEmail {
  return getEmailTemplate(practice, sequenceStep);
}

/**
 * Prioritize practices by conversion potential.
 */
export function prioritizePractices(): RheumatologyPractice[] {
  return [...PRACTICES].sort((a, b) => {
    // Partner practices first, then by conversion score
    if (a.outreach_status === 'partner' && b.outreach_status !== 'partner') return -1;
    if (b.outreach_status === 'partner' && a.outreach_status !== 'partner') return 1;
    if (a.outreach_status === 'meeting_scheduled' && b.outreach_status !== 'meeting_scheduled') return -1;
    if (b.outreach_status === 'meeting_scheduled' && a.outreach_status !== 'meeting_scheduled') return 1;
    if (a.outreach_status === 'responded' && b.outreach_status !== 'responded') return -1;
    if (b.outreach_status === 'responded' && a.outreach_status !== 'responded') return 1;
    return b.conversion_score - a.conversion_score;
  });
}

/**
 * Get outreach campaign stats.
 */
export function getOutreachStats(): {
  total_practices: number;
  not_contacted: number;
  in_sequence: number;
  responded: number;
  meetings_scheduled: number;
  partners: number;
  avg_conversion_score: number;
  response_rate: number;
  emails_bounced: number;
} {
  const total = PRACTICES.length;
  const notContacted = PRACTICES.filter((p) => p.outreach_status === 'not_contacted').length;
  const inSequence = PRACTICES.filter((p) =>
    ['sequence_1', 'sequence_2', 'sequence_3'].includes(p.outreach_status)
  ).length;
  const responded = PRACTICES.filter((p) => p.outreach_status === 'responded').length;
  const meetingsScheduled = PRACTICES.filter((p) => p.outreach_status === 'meeting_scheduled').length;
  const partners = PRACTICES.filter((p) => p.outreach_status === 'partner').length;
  const avgScore = PRACTICES.reduce((s, p) => s + p.conversion_score, 0) / total;
  const contacted = total - notContacted;
  const responseRate = contacted > 0 ? ((responded + meetingsScheduled + partners) / contacted) * 100 : 0;

  return {
    total_practices: total,
    not_contacted: notContacted,
    in_sequence: inSequence,
    responded,
    meetings_scheduled: meetingsScheduled,
    partners,
    avg_conversion_score: Math.round(avgScore),
    response_rate: Math.round(responseRate * 10) / 10,
    emails_bounced: 1,
  };
}

/**
 * Get all practices (for display).
 */
export function getPractices(): RheumatologyPractice[] {
  return [...PRACTICES];
}
