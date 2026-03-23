import { NextRequest, NextResponse } from "next/server";

// Sample 30-day symptom log data for a realistic RA patient
const sampleLogs = generateSampleLogs();

function generateSampleLogs() {
  const logs: any[] = [];
  const joints = [
    "left_hand", "right_hand", "left_wrist", "right_wrist",
    "left_elbow", "right_elbow", "left_shoulder", "right_shoulder",
    "left_knee", "right_knee", "left_ankle", "right_ankle",
    "left_hip", "right_hip", "neck", "jaw",
    "left_foot", "right_foot"
  ];

  // Simulate a patient with a flare starting around day 20
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const isFlare = i <= 10 && i >= 4;
    const isRecovery = i < 4;

    const basePain = isFlare ? 6 : isRecovery ? 4 : 3;
    const painVariance = Math.floor(Math.random() * 3) - 1;

    const numJoints = isFlare ? 4 + Math.floor(Math.random() * 4) : isRecovery ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 3);
    const affectedJoints = [];
    const shuffled = [...joints].sort(() => Math.random() - 0.5);
    for (let j = 0; j < numJoints; j++) affectedJoints.push(shuffled[j]);

    logs.push({
      id: 30 - i,
      profile_id: 1,
      log_date: date.toISOString().split("T")[0],
      pain_score: Math.max(0, Math.min(10, basePain + painVariance)),
      morning_stiffness_minutes: isFlare ? 45 + Math.floor(Math.random() * 60) : isRecovery ? 20 + Math.floor(Math.random() * 20) : 10 + Math.floor(Math.random() * 20),
      affected_joints: affectedJoints,
      fatigue_score: isFlare ? 5 + Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 3),
      sleep_quality: isFlare ? 3 + Math.floor(Math.random() * 2) : 6 + Math.floor(Math.random() * 3),
      stress_level: isFlare ? 5 + Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 3),
      skin_involvement: false,
      medication_taken: Math.random() > (isFlare ? 0.15 : 0.05),
      free_text: isFlare && i === 7 ? "Woke up and could barely close my hands. Worst morning in months." : i === 3 ? "Feeling a bit better today. The new dose adjustment might be helping." : null,
      created_at: date.toISOString(),
    });
  }
  return logs;
}

const labEntries = [
  { id: 1, profile_id: 1, lab_date: "2026-03-01", lab_type: "CRP", value: "1.2", unit: "mg/L", reference_range: "< 1.0", is_abnormal: true, claude_explanation: "Your CRP of 1.2 mg/L is mildly elevated (normal is below 1.0). CRP measures general inflammation in your body. A mild elevation like this can indicate low-level disease activity. Your rheumatologist may want to track this over time." },
  { id: 2, profile_id: 1, lab_date: "2026-03-01", lab_type: "ESR", value: "28", unit: "mm/hr", reference_range: "0-20", is_abnormal: true, claude_explanation: "Your ESR (sed rate) of 28 mm/hr is moderately elevated above the normal range of 0-20. Like CRP, this measures inflammation. Together with your elevated CRP, this suggests active inflammation consistent with your recent symptom patterns." },
  { id: 3, profile_id: 1, lab_date: "2026-02-01", lab_type: "CRP", value: "0.8", unit: "mg/L", reference_range: "< 1.0", is_abnormal: false, claude_explanation: "Your CRP of 0.8 mg/L is within the normal range. This suggests inflammation was well-controlled at the time of this test." },
  { id: 4, profile_id: 1, lab_date: "2026-01-15", lab_type: "RF", value: "45", unit: "IU/mL", reference_range: "< 14", is_abnormal: true, claude_explanation: "Your Rheumatoid Factor (RF) of 45 IU/mL is positive and elevated. RF is an antibody found in about 70-80% of people with RA. A positive RF supports your diagnosis but doesn't directly correlate with disease severity day-to-day." },
  { id: 5, profile_id: 1, lab_date: "2026-01-15", lab_type: "Anti-CCP", value: "68", unit: "U/mL", reference_range: "< 20", is_abnormal: true, claude_explanation: "Your Anti-CCP (anti-cyclic citrullinated peptide) of 68 U/mL is positive. Anti-CCP is highly specific for RA and helps confirm your diagnosis. It's a one-time diagnostic marker — you don't need to recheck it regularly." },
];

const visitNotes = [
  { id: 1, profile_id: 1, visit_date: "2026-04-02", provider_name: "Dr. Rebecca Chen", visit_type: "rheumatology", notes: null, next_visit_date: null },
  { id: 2, profile_id: 1, visit_date: "2026-02-15", provider_name: "Dr. Rebecca Chen", visit_type: "rheumatology", notes: "Discussed increasing morning stiffness. Dr. Chen adjusted methotrexate dose. Ordered updated labs.", medication_changes: "Methotrexate increased from 15mg to 20mg weekly", next_steps: "Recheck labs in 4 weeks, follow up in 8 weeks" },
  { id: 3, profile_id: 1, visit_date: "2025-12-10", provider_name: "Dr. Rebecca Chen", visit_type: "rheumatology", notes: "Stable on current regimen. No significant flares since last visit. Continue current medications.", next_steps: "Follow up in 3 months" },
];

const analyses = [
  {
    id: 1, profile_id: 1, analysis_type: "weekly_summary",
    period_start: "2026-03-16", period_end: "2026-03-22",
    summary_text: "Over the last 7 days, your pain scores averaged 6.4, up from 3.8 the prior week. Morning stiffness has increased significantly, averaging 72 minutes compared to 18 minutes previously. Joint involvement has expanded from 2-3 joints to 5-7 joints, primarily in your hands, wrists, and knees.\n\nThis pattern is consistent with a disease flare. The increase in both objective measures (number of affected joints) and subjective measures (pain, stiffness duration) suggests your current medication regimen may need adjustment.",
    recommendations: [
      { text: "Contact your rheumatologist about the symptom increase — don't wait for your April appointment", priority: "high" },
      { text: "Ask about a short course of prednisone for flare management", priority: "high" },
      { text: "Track whether the flare correlates with any medication changes or missed doses", priority: "medium" },
    ],
    data_points_analyzed: 49,
    conversion_prompt_shown: true,
    conversion_prompt_text: "Your data shows that consistent medication access is one of the most important factors in preventing flares. Our $0 copay program for Humira ensures you never have to delay or skip a dose due to cost.",
  },
  {
    id: 2, profile_id: 1, analysis_type: "flare_alert",
    period_start: "2026-03-18", period_end: "2026-03-20",
    summary_text: "⚠️ FLARE ALERT: Your symptoms over the last 3 days show a sharp escalation pattern. Pain scores have increased by 4 points, morning stiffness has more than tripled, and you reported difficulty closing your hands on March 16. This acceleration pattern often indicates an active flare that may worsen without intervention.",
    recommendations: [
      { text: "Call Dr. Chen's office today — this warrants urgent evaluation", priority: "urgent" },
      { text: "Document your symptoms in detail to share with your provider", priority: "high" },
    ],
    data_points_analyzed: 21,
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // logs, labs, visits, analyses
  const days = parseInt(searchParams.get("days") || "30");

  switch (type) {
    case "logs": {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const filtered = sampleLogs.filter(l => new Date(l.log_date) >= cutoff);
      return NextResponse.json(filtered);
    }
    case "labs":
      return NextResponse.json(labEntries);
    case "visits":
      return NextResponse.json(visitNotes);
    case "analyses":
      return NextResponse.json(analyses);
    default:
      return NextResponse.json({
        profile: {
          id: 1,
          email: "patient@example.com",
          display_name: "Demo Patient",
          primary_condition: "rheumatoid_arthritis",
          diagnosis_year: 2022,
          current_medications: [
            { name: "Humira", dose: "40mg", frequency: "biweekly", is_biologic: true },
            { name: "Methotrexate", dose: "20mg", frequency: "weekly", is_biologic: false },
          ],
          providers: [
            { name: "Dr. Rebecca Chen", specialty: "rheumatology", next_visit: "2026-04-02" },
          ],
          insurance_type: "commercial",
          pharmacy_status: "not_asked",
        },
        recent_logs: sampleLogs.slice(-7),
        recent_labs: labEntries.slice(0, 2),
        upcoming_visits: visitNotes.filter(v => new Date(v.visit_date) > new Date()),
        latest_analysis: analyses[0],
      });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type } = body;

  if (type === "log") {
    const log = {
      id: sampleLogs.length + 1,
      profile_id: 1,
      log_date: new Date().toISOString().split("T")[0],
      ...body.data,
      created_at: new Date().toISOString(),
    };
    sampleLogs.push(log);
    return NextResponse.json(log, { status: 201 });
  }

  if (type === "lab") {
    const lab = {
      id: labEntries.length + 1,
      profile_id: 1,
      ...body.data,
      created_at: new Date().toISOString(),
    };
    labEntries.push(lab);
    return NextResponse.json(lab, { status: 201 });
  }

  if (type === "visit") {
    const visit = {
      id: visitNotes.length + 1,
      profile_id: 1,
      ...body.data,
      created_at: new Date().toISOString(),
    };
    visitNotes.push(visit);
    return NextResponse.json(visit, { status: 201 });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
