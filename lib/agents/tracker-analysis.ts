// Agent 3: Tracker Analysis Engine
// Analyzes patient symptom logs, detects flares, generates visit prep, and contextual $0 copay prompts

import type { TrackerAnalysis, AgentRun } from './types';

/* ─── Types ─── */
interface SymptomLog {
  date: string;
  pain_score: number; // 0-10
  stiffness_minutes: number;
  fatigue_score: number; // 0-10
  swollen_joints: number;
  medication_taken: boolean;
  notes: string;
}

interface FlareAlert {
  profile_id: string;
  alert_level: 'warning' | 'alert' | 'critical';
  trigger_factors: string[];
  message: string;
  recommended_actions: string[];
  generated_at: string;
}

interface VisitPrep {
  profile_id: string;
  visit_date: string;
  period_covered: string;
  summary: string;
  key_metrics: {
    avg_pain: number;
    pain_trend: string;
    avg_stiffness_minutes: number;
    stiffness_trend: string;
    worst_day: string;
    best_day: string;
    adherence_rate: number;
    missed_doses: number;
  };
  discussion_points: string[];
  questions_for_doctor: string[];
  medication_notes: string;
  generated_at: string;
}

interface ConversionPrompt {
  profile_id: string;
  medication_name: string;
  prompt_type: 'cost_barrier' | 'adherence_gap' | 'new_prescription' | 'refill_upcoming';
  headline: string;
  body: string;
  cta: string;
  estimated_savings: string;
  context: string;
  generated_at: string;
}

/* ─── Mock Symptom Logs ─── */
function generateMockLogs(days: number): SymptomLog[] {
  const logs: SymptomLog[] = [];
  const now = Date.now();
  const dayMs = 86400000;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * dayMs).toISOString().split('T')[0];
    // Simulate a gradual improvement with a flare around day 4-5
    const isFlareDay = i >= 3 && i <= 5;
    const baselinePain = 4 - (days - i) * 0.1; // gradual improvement
    const pain = Math.min(10, Math.max(1, Math.round(
      (isFlareDay ? baselinePain + 3 : baselinePain) + (Math.random() - 0.5) * 2
    )));

    logs.push({
      date,
      pain_score: pain,
      stiffness_minutes: isFlareDay ? 45 + Math.floor(Math.random() * 30) : 15 + Math.floor(Math.random() * 20),
      fatigue_score: isFlareDay ? 6 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 3),
      swollen_joints: isFlareDay ? 4 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 2),
      medication_taken: Math.random() > 0.12, // ~88% adherence
      notes: isFlareDay
        ? 'Rough day. Joints very stiff this morning.'
        : i === 0
        ? 'Feeling a bit better today.'
        : '',
    });
  }
  return logs;
}

/* ─── Core Functions ─── */

/**
 * Analyze a patient's weekly symptom data.
 */
export function analyzePatientWeek(
  profileId: string,
  logs?: SymptomLog[]
): TrackerAnalysis {
  const weekLogs = logs || generateMockLogs(7);
  const painScores = weekLogs.map((l) => l.pain_score);
  const stiffnessValues = weekLogs.map((l) => l.stiffness_minutes);
  const avgPain = painScores.reduce((a, b) => a + b, 0) / painScores.length;
  const avgStiffness = stiffnessValues.reduce((a, b) => a + b, 0) / stiffnessValues.length;

  // Pain trend: compare first half to second half
  const firstHalf = painScores.slice(0, Math.floor(painScores.length / 2));
  const secondHalf = painScores.slice(Math.floor(painScores.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const delta = secondAvg - firstAvg;
  const direction = delta < -0.5 ? 'improving' : delta > 0.5 ? 'worsening' : 'stable';

  // Stiffness pattern
  const worstIndex = stiffnessValues.indexOf(Math.max(...stiffnessValues));
  const worstDate = weekLogs[worstIndex]?.date || 'unknown';
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const worstDay = dayNames[new Date(worstDate).getDay()] || 'unknown';

  // Medication adherence
  const taken = weekLogs.filter((l) => l.medication_taken).length;
  const adherenceRate = taken / weekLogs.length;
  const missedDoses = weekLogs.length - taken;

  // Flare risk
  const recentPainHigh = secondAvg > 5;
  const stiffnessIncreasing = stiffnessValues[stiffnessValues.length - 1] > avgStiffness * 1.3;
  const missedMedRecently = weekLogs.slice(-3).some((l) => !l.medication_taken);

  const flareFactors: string[] = [];
  if (recentPainHigh) flareFactors.push('Pain scores trending above 5');
  if (stiffnessIncreasing) flareFactors.push('Morning stiffness increasing');
  if (missedMedRecently) flareFactors.push('Missed doses in last 3 days');

  const flareLevel = flareFactors.length >= 2 ? 'high' : flareFactors.length === 1 ? 'moderate' : 'low';

  // Recommended actions
  const actions: string[] = [];
  if (direction === 'worsening') actions.push('Consider scheduling an appointment with your rheumatologist to discuss symptom changes.');
  if (missedDoses > 1) actions.push('Try setting a medication reminder — consistency is key for biologics.');
  if (flareLevel === 'high') actions.push('A flare may be developing. Rest, apply ice to affected joints, and contact your doctor if symptoms worsen.');
  if (flareLevel === 'low' && direction !== 'worsening') actions.push('Great week! Keep tracking to maintain these insights for your next visit.');
  actions.push('Review your visit prep summary before your next rheumatology appointment.');

  return {
    profile_id: profileId,
    period: `${weekLogs[0]?.date} to ${weekLogs[weekLogs.length - 1]?.date}`,
    pain_trend: {
      direction,
      avg_score: Math.round(avgPain * 10) / 10,
      delta: Math.round(delta * 10) / 10,
    },
    stiffness_pattern: {
      morning_avg_minutes: Math.round(avgStiffness),
      trend: stiffnessIncreasing ? 'increasing' : 'stable',
      worst_day: worstDay,
    },
    flare_risk: {
      level: flareLevel,
      factors: flareFactors,
      recommendation: flareLevel === 'high'
        ? 'Contact your rheumatologist. Multiple indicators suggest a possible flare.'
        : flareLevel === 'moderate'
        ? 'Monitor closely over the next 2-3 days. Log symptoms consistently.'
        : 'Continue current regimen. No immediate concerns.',
    },
    medication_adherence: {
      rate: Math.round(adherenceRate * 100),
      missed_doses: missedDoses,
      pattern: missedDoses === 0
        ? 'Perfect adherence this week.'
        : missedDoses === 1
        ? 'One missed dose. Consider setting a daily reminder.'
        : `${missedDoses} missed doses. Adherence below target. Discuss with your care team.`,
    },
    recommended_actions: actions,
  };
}

/**
 * Generate a flare alert based on recent symptom logs.
 */
export function generateFlareAlert(
  profileId: string,
  recentLogs?: SymptomLog[]
): FlareAlert | null {
  const logs = recentLogs || generateMockLogs(3);
  const avgPain = logs.reduce((s, l) => s + l.pain_score, 0) / logs.length;
  const avgStiffness = logs.reduce((s, l) => s + l.stiffness_minutes, 0) / logs.length;
  const missedMed = logs.some((l) => !l.medication_taken);

  const factors: string[] = [];
  if (avgPain > 6) factors.push('Average pain score above 6 for 3 days');
  if (avgStiffness > 45) factors.push('Morning stiffness averaging over 45 minutes');
  if (missedMed) factors.push('Missed medication dose detected');
  if (logs.some((l) => l.swollen_joints > 4)) factors.push('Elevated joint swelling reported');

  if (factors.length === 0) return null;

  const alertLevel = factors.length >= 3 ? 'critical' : factors.length >= 2 ? 'alert' : 'warning';

  return {
    profile_id: profileId,
    alert_level: alertLevel,
    trigger_factors: factors,
    message: alertLevel === 'critical'
      ? 'Your symptoms over the last 3 days suggest a significant flare. We strongly recommend contacting your rheumatologist today.'
      : alertLevel === 'alert'
      ? 'Your recent symptoms show signs of increasing disease activity. Consider reaching out to your care team.'
      : 'We noticed a slight uptick in your symptoms. Keep tracking and watch for further changes.',
    recommended_actions: [
      ...(alertLevel === 'critical' ? ['Call your rheumatologist today'] : []),
      'Continue logging symptoms daily',
      'Rest affected joints and apply ice as needed',
      'Take medications as prescribed',
      ...(missedMed ? ['Set a medication reminder to avoid missed doses'] : []),
    ],
    generated_at: new Date().toISOString(),
  };
}

/**
 * Generate a visit prep summary for an upcoming rheumatology appointment.
 */
export function generateVisitPrep(
  profileId: string,
  logs?: SymptomLog[],
  labs?: { test: string; value: string; date: string }[],
  visitDate?: string
): VisitPrep {
  const allLogs = logs || generateMockLogs(30);
  const visit = visitDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const mockLabs = labs || [
    { test: 'CRP', value: '8.2 mg/L (elevated)', date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0] },
    { test: 'ESR', value: '28 mm/hr (elevated)', date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0] },
    { test: 'RF', value: '42 IU/mL (positive)', date: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0] },
  ];

  const painScores = allLogs.map((l) => l.pain_score);
  const stiffnessValues = allLogs.map((l) => l.stiffness_minutes);
  const avgPain = painScores.reduce((a, b) => a + b, 0) / painScores.length;
  const avgStiffness = stiffnessValues.reduce((a, b) => a + b, 0) / stiffnessValues.length;
  const taken = allLogs.filter((l) => l.medication_taken).length;

  const worstIdx = painScores.indexOf(Math.max(...painScores));
  const bestIdx = painScores.indexOf(Math.min(...painScores));

  const firstHalf = painScores.slice(0, Math.floor(painScores.length / 2));
  const secondHalf = painScores.slice(Math.floor(painScores.length / 2));
  const trend = (secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length) <
    (firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length) ? 'improving' : 'stable or worsening';

  return {
    profile_id: profileId,
    visit_date: visit,
    period_covered: `${allLogs[0]?.date} to ${allLogs[allLogs.length - 1]?.date}`,
    summary: `Over the past ${allLogs.length} days, your average pain score was ${avgPain.toFixed(1)}/10 (${trend}). Morning stiffness averaged ${Math.round(avgStiffness)} minutes. Medication adherence was ${Math.round((taken / allLogs.length) * 100)}%. ${mockLabs.length > 0 ? `Recent labs show ${mockLabs[0].test} at ${mockLabs[0].value}.` : ''}`,
    key_metrics: {
      avg_pain: Math.round(avgPain * 10) / 10,
      pain_trend: trend,
      avg_stiffness_minutes: Math.round(avgStiffness),
      stiffness_trend: avgStiffness > 30 ? 'above target' : 'within range',
      worst_day: allLogs[worstIdx]?.date || 'N/A',
      best_day: allLogs[bestIdx]?.date || 'N/A',
      adherence_rate: Math.round((taken / allLogs.length) * 100),
      missed_doses: allLogs.length - taken,
    },
    discussion_points: [
      `Pain trend is ${trend} over the past month.`,
      avgStiffness > 30 ? 'Morning stiffness is averaging over 30 minutes — may warrant medication adjustment.' : 'Morning stiffness is within an acceptable range.',
      `CRP is elevated at 8.2 mg/L, suggesting ongoing inflammation.`,
      taken / allLogs.length < 0.9 ? 'Medication adherence is below 90%. Discuss barriers to adherence.' : 'Good medication adherence maintained.',
      'Consider discussing biologic efficacy — has the current regimen reached maximum benefit?',
    ],
    questions_for_doctor: [
      'Given my current pain levels, should we consider adjusting my treatment?',
      'My CRP is elevated — does this indicate my current medication needs changing?',
      'Are there any new therapies or clinical trials I should know about?',
      'Should we schedule imaging to assess disease progression?',
      'How often should I be getting lab work done?',
    ],
    medication_notes: 'Current regimen appears partially effective. If symptoms continue trending upward, discuss adding a conventional DMARD or switching biologic class.',
    generated_at: new Date().toISOString(),
  };
}

/**
 * Generate a contextual $0 copay conversion prompt based on patient data.
 */
export function generateConversionPrompt(
  profileId: string,
  medicationName: string
): ConversionPrompt {
  // Determine prompt type based on mock scenario
  const scenarios: ConversionPrompt[] = [
    {
      profile_id: profileId,
      medication_name: medicationName,
      prompt_type: 'cost_barrier',
      headline: `Your ${medicationName} Could Cost $0`,
      body: `We noticed you\'ve missed 3 doses this month. If cost is a factor, you may qualify for copay assistance that covers 100% of your out-of-pocket costs. Most patients are approved within 48 hours.`,
      cta: 'Check My Eligibility',
      estimated_savings: 'Up to $16,000/year',
      context: 'Triggered by adherence gap > 15% combined with high-cost medication.',
      generated_at: new Date().toISOString(),
    },
    {
      profile_id: profileId,
      medication_name: medicationName,
      prompt_type: 'adherence_gap',
      headline: 'Stay on Track with Your Treatment',
      body: `Consistency matters with ${medicationName}. If you\'re having trouble keeping up, our medication access team can help — from reminders to ensuring your copay stays at $0.`,
      cta: 'Talk to a Specialist',
      estimated_savings: 'Up to $12,000/year',
      context: 'Triggered by 3+ missed doses in a 14-day window.',
      generated_at: new Date().toISOString(),
    },
    {
      profile_id: profileId,
      medication_name: medicationName,
      prompt_type: 'refill_upcoming',
      headline: `${medicationName} Refill Coming Up`,
      body: `Your next refill is in 5 days. Want to make sure your copay stays at $0? Our team can verify your assistance program status and handle any renewal paperwork.`,
      cta: 'Verify My Coverage',
      estimated_savings: 'Up to $1,400/refill',
      context: 'Triggered by refill date approaching within 7 days.',
      generated_at: new Date().toISOString(),
    },
  ];

  // Return the most relevant one (first scenario as default)
  return scenarios[0];
}

/**
 * Run a full analysis cycle (used by the orchestrator).
 */
export function runTrackerAnalysis(): AgentRun {
  // Simulate analyzing multiple patient profiles
  const profileIds = ['profile_001', 'profile_002', 'profile_003', 'profile_004', 'profile_005'];
  const analyses = profileIds.map((id) => analyzePatientWeek(id));
  const alerts = profileIds.map((id) => generateFlareAlert(id)).filter(Boolean);

  return {
    id: Date.now(),
    agent_id: 3,
    started_at: new Date(Date.now() - 120000).toISOString(),
    completed_at: new Date().toISOString(),
    status: 'success',
    items_processed: profileIds.length,
    items_flagged: alerts.length,
    summary: `Analyzed ${profileIds.length} patient profiles. Generated ${alerts.length} flare alerts. ${analyses.filter((a) => a.flare_risk.level === 'high').length} patients at high flare risk.`,
    output: {
      profiles_analyzed: profileIds.length,
      flare_alerts: alerts.length,
      high_risk_patients: analyses.filter((a) => a.flare_risk.level === 'high').length,
      avg_adherence: Math.round(analyses.reduce((s, a) => s + a.medication_adherence.rate, 0) / analyses.length),
      conversion_prompts_generated: 2,
    },
    human_review_needed: alerts.length > 0,
  };
}
