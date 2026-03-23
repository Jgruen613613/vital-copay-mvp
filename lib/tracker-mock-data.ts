// Mock data store for the VITAL Symptom Tracker MVP
// All data is in-memory — no Supabase required

export interface TrackerProfile {
  id: string;
  email: string;
  primary_condition: string;
  insurance_type: string;
  created_at: string;
  streak_days: number;
  current_medication: string | null;
}

export interface SymptomLog {
  id: string;
  date: string;
  pain_score: number;
  morning_stiffness_minutes: number;
  fatigue_score: number;
  sleep_quality: number;
  stress_level: number;
  affected_joints: string[];
  skin_involvement: boolean;
  skin_notes: string;
  medication_taken: boolean;
  medication_time: string | null;
  notable_events: string;
  free_text: string;
  created_at: string;
}

export interface LabEntry {
  id: string;
  date: string;
  lab_type: string;
  value: number;
  unit: string;
  reference_range: string;
  is_abnormal: boolean;
  explanation: string;
  created_at: string;
}

export interface VisitNote {
  id: string;
  date: string;
  provider_name: string;
  visit_type: string;
  notes: string;
  is_upcoming: boolean;
  created_at: string;
}

export interface Analysis {
  id: string;
  date: string;
  period_days: number;
  summary: string;
  recommendations: string[];
  avg_pain: number;
  avg_stiffness: number;
  flare_detected: boolean;
  created_at: string;
}

export interface VisitPrep {
  id: string;
  visit_id: string;
  generated_at: string;
  trend_summary: string;
  flare_analysis: string;
  adherence_record: string;
  recommended_questions: string[];
  provider_name: string;
  visit_date: string;
}

// --- Sample profile ---
const sampleProfile: TrackerProfile = {
  id: 'prof_001',
  email: 'patient@example.com',
  primary_condition: 'rheumatoid_arthritis',
  insurance_type: 'commercial',
  created_at: '2026-03-09T08:00:00Z',
  streak_days: 14,
  current_medication: 'Humira (adalimumab)',
};

// --- 30 days of symptom logs (realistic RA fluctuation) ---
const jointSets = {
  mild: ['right_hand', 'left_wrist'],
  moderate: ['right_hand', 'left_hand', 'left_wrist', 'right_wrist', 'right_knee'],
  flare: ['right_hand', 'left_hand', 'left_wrist', 'right_wrist', 'right_knee', 'left_knee', 'right_elbow', 'right_shoulder'],
  good: ['right_hand'],
  minimal: [],
};

function generateDate(daysAgo: number): string {
  const d = new Date('2026-03-23T00:00:00Z');
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const symptomPatterns: Array<{
  pain: number; stiffness: number; fatigue: number; sleep: number; stress: number;
  joints: keyof typeof jointSets; medTaken: boolean; skin: boolean;
}> = [
  // Days 0-6 (most recent week — emerging flare)
  { pain: 7, stiffness: 75, fatigue: 7, sleep: 4, stress: 6, joints: 'flare', medTaken: true, skin: true },
  { pain: 6, stiffness: 60, fatigue: 6, sleep: 5, stress: 5, joints: 'moderate', medTaken: true, skin: true },
  { pain: 7, stiffness: 90, fatigue: 8, sleep: 3, stress: 7, joints: 'flare', medTaken: true, skin: true },
  { pain: 5, stiffness: 45, fatigue: 5, sleep: 5, stress: 5, joints: 'moderate', medTaken: true, skin: false },
  { pain: 6, stiffness: 60, fatigue: 6, sleep: 4, stress: 6, joints: 'moderate', medTaken: true, skin: true },
  { pain: 5, stiffness: 45, fatigue: 5, sleep: 6, stress: 4, joints: 'moderate', medTaken: false, skin: false },
  { pain: 4, stiffness: 30, fatigue: 4, sleep: 6, stress: 4, joints: 'mild', medTaken: true, skin: false },
  // Days 7-13 (prior week — stable low)
  { pain: 3, stiffness: 15, fatigue: 3, sleep: 7, stress: 3, joints: 'mild', medTaken: true, skin: false },
  { pain: 3, stiffness: 15, fatigue: 3, sleep: 7, stress: 3, joints: 'good', medTaken: true, skin: false },
  { pain: 4, stiffness: 30, fatigue: 4, sleep: 6, stress: 4, joints: 'mild', medTaken: true, skin: false },
  { pain: 2, stiffness: 10, fatigue: 2, sleep: 8, stress: 2, joints: 'good', medTaken: true, skin: false },
  { pain: 3, stiffness: 15, fatigue: 3, sleep: 7, stress: 3, joints: 'mild', medTaken: true, skin: false },
  { pain: 3, stiffness: 15, fatigue: 3, sleep: 8, stress: 2, joints: 'good', medTaken: true, skin: false },
  { pain: 4, stiffness: 30, fatigue: 4, sleep: 6, stress: 4, joints: 'mild', medTaken: true, skin: false },
  // Days 14-20 (two weeks ago — moderate)
  { pain: 5, stiffness: 45, fatigue: 5, sleep: 5, stress: 5, joints: 'moderate', medTaken: true, skin: false },
  { pain: 4, stiffness: 30, fatigue: 4, sleep: 6, stress: 4, joints: 'mild', medTaken: true, skin: false },
  { pain: 5, stiffness: 45, fatigue: 5, sleep: 5, stress: 5, joints: 'moderate', medTaken: false, skin: false },
  { pain: 4, stiffness: 30, fatigue: 4, sleep: 6, stress: 4, joints: 'mild', medTaken: true, skin: false },
  { pain: 3, stiffness: 15, fatigue: 3, sleep: 7, stress: 3, joints: 'good', medTaken: true, skin: false },
  { pain: 4, stiffness: 30, fatigue: 5, sleep: 5, stress: 5, joints: 'mild', medTaken: true, skin: false },
  { pain: 5, stiffness: 45, fatigue: 5, sleep: 5, stress: 5, joints: 'moderate', medTaken: true, skin: false },
  // Days 21-29 (three+ weeks ago — recovering from prior flare)
  { pain: 6, stiffness: 60, fatigue: 6, sleep: 4, stress: 6, joints: 'moderate', medTaken: true, skin: true },
  { pain: 7, stiffness: 75, fatigue: 7, sleep: 4, stress: 7, joints: 'flare', medTaken: true, skin: true },
  { pain: 8, stiffness: 90, fatigue: 8, sleep: 3, stress: 8, joints: 'flare', medTaken: true, skin: true },
  { pain: 6, stiffness: 60, fatigue: 6, sleep: 4, stress: 6, joints: 'moderate', medTaken: true, skin: false },
  { pain: 5, stiffness: 45, fatigue: 5, sleep: 5, stress: 5, joints: 'moderate', medTaken: true, skin: false },
  { pain: 4, stiffness: 30, fatigue: 4, sleep: 6, stress: 4, joints: 'mild', medTaken: true, skin: false },
  { pain: 3, stiffness: 15, fatigue: 3, sleep: 7, stress: 3, joints: 'good', medTaken: true, skin: false },
  { pain: 4, stiffness: 30, fatigue: 4, sleep: 6, stress: 4, joints: 'mild', medTaken: true, skin: false },
  { pain: 5, stiffness: 45, fatigue: 5, sleep: 5, stress: 5, joints: 'moderate', medTaken: true, skin: false },
];

const sampleLogs: SymptomLog[] = symptomPatterns.map((p, i) => ({
  id: `log_${String(i + 1).padStart(3, '0')}`,
  date: generateDate(i),
  pain_score: p.pain,
  morning_stiffness_minutes: p.stiffness,
  fatigue_score: p.fatigue,
  sleep_quality: p.sleep,
  stress_level: p.stress,
  affected_joints: jointSets[p.joints],
  skin_involvement: p.skin,
  skin_notes: p.skin ? 'Mild psoriatic patches on elbows' : '',
  medication_taken: p.medTaken,
  medication_time: p.medTaken ? '08:00' : null,
  notable_events: i === 0 ? 'Stressful week at work, poor sleep' : i === 23 ? 'Caught a cold, felt terrible' : '',
  free_text: '',
  created_at: generateDate(i) + 'T20:00:00Z',
}));

// --- 5 sample lab entries ---
const sampleLabEntries: LabEntry[] = [
  {
    id: 'lab_001',
    date: '2026-03-20',
    lab_type: 'CRP',
    value: 2.8,
    unit: 'mg/L',
    reference_range: '< 1.0',
    is_abnormal: true,
    explanation: 'Your CRP of 2.8 mg/L is mildly elevated (normal < 1.0). CRP measures general inflammation in your body. Mildly elevated levels can indicate an active inflammatory process, which is consistent with your recent symptom increase. Your rheumatologist may want to discuss treatment adjustments.',
    created_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 'lab_002',
    date: '2026-03-20',
    lab_type: 'ESR',
    value: 28,
    unit: 'mm/hr',
    reference_range: '0-20',
    is_abnormal: true,
    explanation: 'Your ESR of 28 mm/hr is above the normal range of 0-20. ESR (sed rate) is another marker of inflammation. Like your CRP, this suggests active inflammation. ESR tends to change more slowly than CRP, so this may reflect inflammation over the past few weeks.',
    created_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 'lab_003',
    date: '2026-03-06',
    lab_type: 'CRP',
    value: 0.8,
    unit: 'mg/L',
    reference_range: '< 1.0',
    is_abnormal: false,
    explanation: 'Your CRP of 0.8 mg/L is within the normal range. This suggests your inflammation was well controlled at this time, which lines up with the lower symptom scores you logged that week.',
    created_at: '2026-03-06T10:00:00Z',
  },
  {
    id: 'lab_004',
    date: '2026-02-20',
    lab_type: 'RF',
    value: 45,
    unit: 'IU/mL',
    reference_range: '< 14',
    is_abnormal: true,
    explanation: 'Your Rheumatoid Factor of 45 IU/mL is elevated (normal < 14). RF is an antibody found in about 80% of people with RA. A positive RF supports your RA diagnosis but does not directly correlate with disease activity day-to-day.',
    created_at: '2026-02-20T10:00:00Z',
  },
  {
    id: 'lab_005',
    date: '2026-02-20',
    lab_type: 'Liver Function',
    value: 32,
    unit: 'U/L (ALT)',
    reference_range: '7-56',
    is_abnormal: false,
    explanation: 'Your ALT of 32 U/L is within normal range (7-56). Liver function is monitored because some RA medications can affect the liver. This result is reassuring and suggests your current medications are not causing liver stress.',
    created_at: '2026-02-20T10:00:00Z',
  },
];

// --- 3 sample visit notes ---
const sampleVisitNotes: VisitNote[] = [
  {
    id: 'visit_001',
    date: '2026-04-02',
    provider_name: 'Dr. Sarah Chen',
    visit_type: 'Rheumatology Follow-up',
    notes: 'Quarterly check-in. Discuss recent flare pattern and whether to adjust Humira dose or add methotrexate.',
    is_upcoming: true,
    created_at: '2026-03-15T08:00:00Z',
  },
  {
    id: 'visit_002',
    date: '2026-04-15',
    provider_name: 'Dr. James Park',
    visit_type: 'Dermatology',
    notes: 'Follow-up on psoriatic skin involvement. Bring photos of patches.',
    is_upcoming: true,
    created_at: '2026-03-20T08:00:00Z',
  },
  {
    id: 'visit_003',
    date: '2026-03-06',
    provider_name: 'Dr. Sarah Chen',
    visit_type: 'Rheumatology Follow-up',
    notes: 'Disease stable. Continue current Humira regimen. Labs ordered: CRP, ESR, CBC. Return in 4 weeks or sooner if flare.',
    is_upcoming: false,
    created_at: '2026-03-06T15:00:00Z',
  },
];

// --- 2 sample analyses ---
const sampleAnalyses: Analysis[] = [
  {
    id: 'analysis_001',
    date: '2026-03-23',
    period_days: 7,
    summary: 'Over the last 7 days, your pain scores averaged 5.7, up from 3.1 the prior week. Morning stiffness has increased by 40%, now averaging 58 minutes compared to 19 minutes previously. Joint involvement has expanded from 1-2 joints to 5-8 joints. This pattern is consistent with an emerging flare.',
    recommendations: [
      'Contact your rheumatologist to discuss your worsening symptoms before your April 2nd appointment.',
      'Prioritize sleep hygiene — your sleep quality dropped to 4.7/10, and poor sleep can amplify RA symptoms.',
      'Track whether stress reduction (the notable work stress you logged) correlates with symptom improvement over the next few days.',
    ],
    avg_pain: 5.7,
    avg_stiffness: 58,
    flare_detected: true,
    created_at: '2026-03-23T06:00:00Z',
  },
  {
    id: 'analysis_002',
    date: '2026-03-16',
    period_days: 7,
    summary: 'Over the last 7 days, your pain scores averaged 3.1, down from 4.4 the prior week. Morning stiffness has decreased to an average of 19 minutes. This is your best week in the past month. Your medication adherence was 100% this week, which likely contributed to the improvement.',
    recommendations: [
      'Continue your current medication schedule — 100% adherence this week correlated with your best symptoms.',
      'Consider gentle exercise on good days to maintain joint mobility while inflammation is low.',
      'Your upcoming labs on March 20th will help confirm whether the improvement is reflected in your inflammation markers.',
    ],
    avg_pain: 3.1,
    avg_stiffness: 19,
    flare_detected: false,
    created_at: '2026-03-16T06:00:00Z',
  },
];

// --- Sample visit prep ---
const sampleVisitPreps: VisitPrep[] = [
  {
    id: 'prep_001',
    visit_id: 'visit_001',
    generated_at: '2026-03-23T12:00:00Z',
    trend_summary: 'Over the past 90 days, you experienced one significant flare (Feb 22-25, peak pain 8/10) that resolved over 5 days, followed by a stable period (Mar 1-16, avg pain 3.2/10), and a current emerging flare (Mar 17-23, avg pain 5.7/10). Morning stiffness has been the most responsive indicator, ranging from 10 minutes on good days to 90 minutes during flares.',
    flare_analysis: 'Two flare episodes detected in the past 90 days. The current flare appears to be triggered by increased stress and possible missed medication dose on Day 6. Joint involvement has expanded bilaterally, now affecting hands, wrists, knees, and right elbow. Skin involvement (psoriatic patches) has returned concurrent with joint flares both times.',
    adherence_record: 'Medication adherence: 93% over 30 days (28/30 doses taken). Two missed doses noted — one during current flare period and one two weeks prior. Adherence was 100% during your best symptom week (Mar 9-15).',
    recommended_questions: [
      'My symptoms have worsened over the past week despite consistent medication. Should we consider adding methotrexate or adjusting my Humira dose?',
      'I notice my flares correlate with stress and missed sleep. Are there evidence-based approaches to reduce stress-triggered flares?',
      'My CRP increased from 0.8 to 2.8 over two weeks. How concerned should we be, and should we recheck sooner?',
      'I have skin patches appearing during flares. Should I see dermatology sooner, or can we address this in the RA treatment plan?',
      'What are the signs that my current biologic is losing effectiveness, and at what point should we discuss switching?',
    ],
    provider_name: 'Dr. Sarah Chen',
    visit_date: '2026-04-02',
  },
];

// --- In-memory mutable stores ---
let logs = [...sampleLogs];
let labEntries = [...sampleLabEntries];
let visitNotes = [...sampleVisitNotes];
let profile = { ...sampleProfile };

// --- Public API functions ---

export function getProfile(): TrackerProfile {
  return { ...profile };
}

export function getLogs(days: number = 30): SymptomLog[] {
  const cutoff = new Date('2026-03-23T00:00:00Z');
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  return logs
    .filter((l) => l.date >= cutoffStr)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function addLog(log: Omit<SymptomLog, 'id' | 'created_at'>): SymptomLog {
  const newLog: SymptomLog = {
    ...log,
    id: `log_${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  logs = [newLog, ...logs];
  profile.streak_days += 1;
  return newLog;
}

export function getLabEntries(): LabEntry[] {
  return [...labEntries].sort((a, b) => b.date.localeCompare(a.date));
}

export function addLabEntry(entry: Omit<LabEntry, 'id' | 'created_at'>): LabEntry {
  const newEntry: LabEntry = {
    ...entry,
    id: `lab_${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  labEntries = [newEntry, ...labEntries];
  return newEntry;
}

export function getVisitNotes(): VisitNote[] {
  return [...visitNotes].sort((a, b) => {
    if (a.is_upcoming && !b.is_upcoming) return -1;
    if (!a.is_upcoming && b.is_upcoming) return 1;
    return b.date.localeCompare(a.date);
  });
}

export function addVisitNote(note: Omit<VisitNote, 'id' | 'created_at'>): VisitNote {
  const newNote: VisitNote = {
    ...note,
    id: `visit_${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  visitNotes = [newNote, ...visitNotes];
  return newNote;
}

export function getAnalyses(): Analysis[] {
  return [...sampleAnalyses].sort((a, b) => b.date.localeCompare(a.date));
}

export function generateVisitPrep(visitId: string): VisitPrep | null {
  const prep = sampleVisitPreps.find((p) => p.visit_id === visitId);
  if (prep) return { ...prep };
  // Generate a generic prep for any visit
  const visit = visitNotes.find((v) => v.id === visitId);
  if (!visit) return null;
  return {
    id: `prep_${Date.now()}`,
    visit_id: visitId,
    generated_at: new Date().toISOString(),
    trend_summary: 'Over the past 90 days, your symptoms have fluctuated between stable periods and emerging flares. Average pain score: 4.5/10. Average morning stiffness: 38 minutes. Joint involvement ranges from 1-8 joints depending on disease activity.',
    flare_analysis: 'Two flare episodes detected in the past 90 days. Flares appear correlated with increased stress, poor sleep, and occasional missed medication doses.',
    adherence_record: 'Medication adherence: 93% over 30 days. Two missed doses noted.',
    recommended_questions: [
      'Are my current symptoms controlled well enough, or should we adjust my treatment plan?',
      'What lifestyle modifications could help reduce flare frequency?',
      'Should we order any additional labs based on my recent symptom patterns?',
      'What are the warning signs that would warrant contacting you between appointments?',
      'Are there any clinical trials or newer treatments I should know about?',
    ],
    provider_name: visit.provider_name,
    visit_date: visit.date,
  };
}

// Joint map data for the body map component
export const JOINT_MAP: Array<{ id: string; label: string; cx: number; cy: number }> = [
  { id: 'neck', label: 'Neck', cx: 100, cy: 58 },
  { id: 'jaw', label: 'Jaw', cx: 100, cy: 38 },
  { id: 'left_shoulder', label: 'L Shoulder', cx: 65, cy: 85 },
  { id: 'right_shoulder', label: 'R Shoulder', cx: 135, cy: 85 },
  { id: 'left_elbow', label: 'L Elbow', cx: 48, cy: 130 },
  { id: 'right_elbow', label: 'R Elbow', cx: 152, cy: 130 },
  { id: 'left_wrist', label: 'L Wrist', cx: 38, cy: 170 },
  { id: 'right_wrist', label: 'R Wrist', cx: 162, cy: 170 },
  { id: 'left_hand', label: 'L Hand', cx: 30, cy: 195 },
  { id: 'right_hand', label: 'R Hand', cx: 170, cy: 195 },
  { id: 'left_hip', label: 'L Hip', cx: 78, cy: 190 },
  { id: 'right_hip', label: 'R Hip', cx: 122, cy: 190 },
  { id: 'left_knee', label: 'L Knee', cx: 80, cy: 255 },
  { id: 'right_knee', label: 'R Knee', cx: 120, cy: 255 },
  { id: 'left_ankle', label: 'L Ankle', cx: 80, cy: 320 },
  { id: 'right_ankle', label: 'R Ankle', cx: 120, cy: 320 },
  { id: 'left_foot', label: 'L Foot', cx: 75, cy: 345 },
  { id: 'right_foot', label: 'R Foot', cx: 125, cy: 345 },
];
