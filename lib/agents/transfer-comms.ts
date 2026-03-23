// Agent 4: Transfer Communication Engine
// Manages patient communications throughout the prescription transfer process
// Handles status messages, timelines, exceptions, and escalations

import type { AgentRun, ContentQueueItem } from './types';
import type { Transfer, TransferStatus } from '../transfer-mock-data';

/* ─── Status Message Templates ─── */
interface StatusMessage {
  sms: string;
  email_subject: string;
  email_body: string;
}

const STATUS_MESSAGES: Record<TransferStatus, (transfer: Transfer) => StatusMessage> = {
  submitted: (t) => ({
    sms: `Hi! Your prescription transfer request has been received. We'll verify your eligibility within 2 hours. - VITAL Health`,
    email_subject: 'Transfer Request Received — VITAL Health',
    email_body: `Your prescription transfer request for ${t.medication_name} has been received.\n\nReference: #VH-2026-${String(t.id).padStart(3, '0')}\nSubmitted: ${new Date(t.created_at).toLocaleDateString()}\n\nNext step: We'll verify your eligibility for copay assistance within 2 hours.\n\nTrack your status anytime at vitalhealthrx.com/transfer/status\n\nQuestions? Reply to this email or call (800) 555-1234.`,
  }),
  eligibility_verified: (t) => ({
    sms: `Great news! You're eligible for $0 copay on ${t.medication_name.split(' (')[0]} through copay assistance. We're contacting your pharmacy now. - VITAL Health`,
    email_subject: `Eligibility Confirmed — $0 Copay on ${t.medication_name.split(' (')[0]}`,
    email_body: `Exciting update on your transfer request!\n\nWe've confirmed your eligibility for copay assistance. Here's what this means:\n\n• Estimated savings: ${t.estimated_savings}\n• Your estimated copay: $0\n• Program status: Active and accepting patients\n\nNext step: We're reaching out to ${t.current_pharmacy_name} to initiate your prescription transfer. This typically takes 24 hours.\n\nTrack progress: vitalhealthrx.com/transfer/status`,
  }),
  pharmacy_contacted: (t) => ({
    sms: `Update: We've contacted ${t.current_pharmacy_name} and your prescription transfer is in progress. Next step: prescriber confirmation. - VITAL Health`,
    email_subject: 'Pharmacy Transfer In Progress',
    email_body: `We've reached ${t.current_pharmacy_name} and your prescription transfer is underway.\n\nStatus: ${t.current_pharmacy_name} has confirmed your current prescription and is processing the transfer.\n\nNext step: We'll contact ${t.prescriber_name}'s office to confirm and send a new prescription to VITAL Health pharmacy.\n\nEstimated timeline: 1-3 business days for prescriber confirmation.`,
  }),
  prescriber_contacted: (t) => ({
    sms: `${t.prescriber_name} has confirmed your prescription. We're now submitting your prior authorization. This typically takes 3-5 business days. - VITAL Health`,
    email_subject: 'Prescriber Confirmed — Prior Authorization Next',
    email_body: `${t.prescriber_name}'s office has confirmed your prescription for ${t.medication_name}.\n\nA new prescription has been sent to VITAL Health pharmacy.\n\nNext step: Prior authorization submission to ${t.insurance_provider}. This is the step where we get your insurance to formally approve the medication at your new pharmacy.\n\nTypical timeline: 3-5 business days. We'll keep you updated at every step.`,
  }),
  pa_initiated: (t) => ({
    sms: `Your prior authorization has been submitted to ${t.insurance_provider}. Typical turnaround is 3-5 business days. We're monitoring it closely. - VITAL Health`,
    email_subject: 'Prior Authorization Submitted',
    email_body: `We've submitted your prior authorization to ${t.insurance_provider}.\n\nWhat's happening:\n• Our team has submitted all required clinical documentation\n• Your insurance is reviewing the authorization\n• Average turnaround: 3-5 business days\n\nWe monitor PA status daily and will follow up with your insurance if there are any delays. You don't need to do anything at this point.\n\nWe'll notify you immediately when we hear back.`,
  }),
  pa_approved: (t) => ({
    sms: `Your prior authorization has been APPROVED by ${t.insurance_provider}! We're finalizing your transfer now. Almost there! - VITAL Health`,
    email_subject: 'PA Approved! Transfer Nearly Complete',
    email_body: `Excellent news! Your prior authorization has been approved by ${t.insurance_provider}.\n\nThis means:\n• Your insurance has approved ${t.medication_name} at VITAL Health pharmacy\n• Your copay assistance program is active\n• Your estimated copay: $0\n\nNext step: We're completing the transfer and preparing your first fill. Expected shipping within 2-3 business days.`,
  }),
  transfer_complete: (t) => ({
    sms: `Your prescription transfer is complete! Your ${t.medication_name.split(' (')[0]} is now at VITAL Health pharmacy. First fill shipping soon. - VITAL Health`,
    email_subject: 'Transfer Complete! First Fill Coming Soon',
    email_body: `Your prescription transfer is officially complete!\n\n${t.medication_name} is now managed by VITAL Health pharmacy with your copay assistance program active.\n\nYour copay: $0\nEstimated annual savings: ${t.estimated_savings}\n\nNext step: Your first fill is being prepared and will ship within 1-2 business days. You'll receive tracking information via text.\n\nFor refills, we'll contact you automatically before each fill is due.`,
  }),
  first_fill_shipped: (t) => ({
    sms: `Your ${t.medication_name.split(' (')[0]} has shipped! FedEx Priority Overnight. Expected delivery: tomorrow by 10:30am. - VITAL Health`,
    email_subject: `Your ${t.medication_name.split(' (')[0]} Has Shipped!`,
    email_body: `Your medication is on its way!\n\nMedication: ${t.medication_name}\nDose: ${t.current_dose}\nShipping: FedEx Priority Overnight\nExpected delivery: Tomorrow by 10:30am\n\nImportant reminders:\n• Refrigerate upon arrival if biologic\n• Contact us if package shows damage\n• Your next refill will be coordinated automatically\n\nYour copay for this fill: $0\nSavings this fill: Estimated $1,400+\n\nWelcome to VITAL Health. We're here whenever you need us.`,
  }),
  exception: (t) => ({
    sms: `We need your attention on your ${t.medication_name.split(' (')[0]} transfer. A VITAL specialist will call you today. - VITAL Health`,
    email_subject: 'Action Needed on Your Transfer',
    email_body: `We've encountered an issue with your prescription transfer that needs your input.\n\nA VITAL Health specialist will be calling you today at the number on file to discuss next steps and resolve this quickly.\n\nIf you'd prefer to call us directly: (800) 555-1234\n\nDon't worry — we handle situations like this regularly and have a clear path forward.`,
  }),
};

/* ─── Exception Handling ─── */
interface ExceptionResponse {
  exception_type: string;
  patient_message: string;
  internal_action: string;
  escalation_level: 'standard' | 'urgent' | 'critical';
  follow_up_hours: number;
}

const EXCEPTION_HANDLERS: Record<string, (transfer: Transfer) => ExceptionResponse> = {
  pa_denied: (t) => ({
    exception_type: 'pa_denied',
    patient_message: `Your prior authorization for ${t.medication_name.split(' (')[0]} was initially denied by ${t.insurance_provider}. Don't worry — this happens frequently and we have a strong appeal process. Our team is preparing an appeal with additional clinical documentation from ${t.prescriber_name}. We'll keep you updated.`,
    internal_action: `File urgent appeal with ${t.insurance_provider}. Request clinical letter of necessity from ${t.prescriber_name}. Include: diagnosis codes, medication history, failed alternatives. Deadline: 72 hours for expedited review.`,
    escalation_level: 'urgent',
    follow_up_hours: 24,
  }),
  prescriber_no_response: (t) => ({
    exception_type: 'prescriber_no_response',
    patient_message: `We haven't been able to reach ${t.prescriber_name}'s office yet. We'll continue trying and keep you posted. If you speak with their office before we do, please let them know VITAL Health is requesting a new prescription.`,
    internal_action: `Attempt #3 to reach ${t.prescriber_name} at ${t.prescriber_phone}. Try fax, EHR message, and direct call. If no response by end of business, ask patient to contact prescriber directly. Consider alternate prescriber outreach.`,
    escalation_level: 'standard',
    follow_up_hours: 48,
  }),
  pharmacy_transfer_delay: (t) => ({
    exception_type: 'pharmacy_transfer_delay',
    patient_message: `There's a slight delay in transferring your prescription from ${t.current_pharmacy_name}. This sometimes happens with specialty medications. We're working directly with their team to resolve this and expect it to be completed within 24-48 hours.`,
    internal_action: `Escalate with ${t.current_pharmacy_name} transfer department. Confirm Rx number and quantity on file. Request expedited processing. If blocked, request new Rx from prescriber directly.`,
    escalation_level: 'standard',
    follow_up_hours: 24,
  }),
  insurance_info_mismatch: (t) => ({
    exception_type: 'insurance_info_mismatch',
    patient_message: `We need to verify your insurance information. The details on file don't match what ${t.insurance_provider} has in their system. A VITAL specialist will call you to collect the correct information.`,
    internal_action: `Insurance verification failed. Member ID ${t.member_id} not found in ${t.insurance_provider} system. Schedule call with patient to re-verify: group number, subscriber DOB, policy effective date.`,
    escalation_level: 'urgent',
    follow_up_hours: 4,
  }),
  copay_program_closed: (t) => ({
    exception_type: 'copay_program_closed',
    patient_message: `The copay assistance program we identified for ${t.medication_name.split(' (')[0]} has temporarily closed enrollment. We're actively monitoring for when it reopens and are also checking alternative programs. We'll update you as soon as we find a solution.`,
    internal_action: `Primary copay program closed. Check: (1) Alternative manufacturer programs, (2) Foundation grants — PAN, HealthWell, NORD, (3) Bridge program availability, (4) State-specific assistance programs for ${t.state}. Add to fund monitoring watchlist.`,
    escalation_level: 'urgent',
    follow_up_hours: 12,
  }),
};

/* ─── Exported Functions ─── */

/**
 * Get the appropriate patient message for a transfer status change.
 */
export function getStatusMessage(
  transfer: Transfer,
  newStatus: TransferStatus
): StatusMessage {
  const handler = STATUS_MESSAGES[newStatus];
  return handler(transfer);
}

/**
 * Generate a timeline of events for a transfer.
 */
export function generateTransferTimeline(transfer: Transfer): {
  stage: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  date: string | null;
  message: string;
}[] {
  const currentIndex = transfer.timeline.findIndex(
    (e) => e.status === transfer.status && !e.completed_at
  );

  return transfer.timeline.map((event, i) => {
    const isCompleted = event.completed_at !== null;
    const isCurrent = i === currentIndex;

    return {
      stage: event.status,
      label: event.label,
      status: isCompleted ? 'completed' as const : isCurrent ? 'current' as const : 'upcoming' as const,
      date: event.completed_at || event.estimated_completion,
      message: isCompleted
        ? event.notes || `${event.label} completed.`
        : isCurrent
        ? event.notes || `${event.label} in progress.`
        : `Estimated: ${event.estimated_completion ? new Date(event.estimated_completion).toLocaleDateString() : 'TBD'}`,
    };
  });
}

/**
 * Handle a transfer exception (PA denial, prescriber no-response, etc.).
 */
export function handleException(
  transfer: Transfer,
  exceptionType: string
): ExceptionResponse {
  const handler = EXCEPTION_HANDLERS[exceptionType];
  if (!handler) {
    return {
      exception_type: exceptionType,
      patient_message: 'We encountered an issue with your transfer. A VITAL specialist will contact you shortly to resolve it.',
      internal_action: `Unknown exception type: ${exceptionType}. Assign to senior specialist for review.`,
      escalation_level: 'urgent',
      follow_up_hours: 4,
    };
  }
  return handler(transfer);
}

/**
 * Get transfers needing human attention.
 */
export function getEscalationList(): {
  transfer_id: number;
  patient_email: string;
  medication: string;
  reason: string;
  priority: 'standard' | 'urgent' | 'critical';
  hours_since_last_update: number;
}[] {
  return [
    {
      transfer_id: 5,
      patient_email: 'robert.t@example.com',
      medication: 'Stelara (ustekinumab)',
      reason: 'PA denied by Cigna. Appeal deadline in 48 hours.',
      priority: 'critical',
      hours_since_last_update: 18,
    },
    {
      transfer_id: 8,
      patient_email: 'karen.w@example.com',
      medication: 'Humira (adalimumab)',
      reason: 'Prescriber office unresponsive after 3 contact attempts.',
      priority: 'urgent',
      hours_since_last_update: 72,
    },
    {
      transfer_id: 12,
      patient_email: 'michael.s@example.com',
      medication: 'Rinvoq (upadacitinib)',
      reason: 'Insurance info mismatch. Patient callback scheduled but missed.',
      priority: 'urgent',
      hours_since_last_update: 24,
    },
    {
      transfer_id: 15,
      patient_email: 'jennifer.l@example.com',
      medication: 'Enbrel (etanercept)',
      reason: 'Copay program (Amgen FIRST STEP) fund closed. Checking alternatives.',
      priority: 'urgent',
      hours_since_last_update: 8,
    },
    {
      transfer_id: 19,
      patient_email: 'david.c@example.com',
      medication: 'Xeljanz (tofacitinib)',
      reason: 'Pharmacy transfer delayed — previous pharmacy requesting additional verification.',
      priority: 'standard',
      hours_since_last_update: 36,
    },
  ];
}

/**
 * Run the transfer communications agent.
 */
export function runTransferComms(): AgentRun {
  const escalations = getEscalationList();
  const criticalCount = escalations.filter((e) => e.priority === 'critical').length;

  return {
    id: Date.now(),
    agent_id: 4,
    started_at: new Date(Date.now() - 60000).toISOString(),
    completed_at: new Date().toISOString(),
    status: 'success',
    items_processed: 28,
    items_flagged: escalations.length,
    summary: `Processed 28 active transfers. Sent 12 status update messages. ${escalations.length} transfers need human attention (${criticalCount} critical). 3 PA status checks pending response.`,
    output: {
      messages_sent: 12,
      escalations: escalations.length,
      critical_escalations: criticalCount,
      pa_checks_pending: 3,
      avg_transfer_age_days: 4.2,
    },
    human_review_needed: criticalCount > 0,
  };
}
