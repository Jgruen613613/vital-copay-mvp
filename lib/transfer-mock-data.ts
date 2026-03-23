// Mock data and functions for the prescription transfer engine

export type TransferStatus =
  | 'submitted'
  | 'eligibility_verified'
  | 'pharmacy_contacted'
  | 'prescriber_contacted'
  | 'pa_initiated'
  | 'pa_approved'
  | 'transfer_complete'
  | 'first_fill_shipped'
  | 'exception';

export interface Transfer {
  id: number;
  email: string;
  phone: string;
  medication_name: string;
  insurance_type: string;
  state: string;
  current_pharmacy_name: string;
  current_pharmacy_phone: string;
  prescriber_name: string;
  prescriber_phone: string;
  current_dose: string;
  date_of_birth: string;
  insurance_provider: string;
  member_id: string;
  consent_given: boolean;
  status: TransferStatus;
  estimated_savings: string;
  created_at: string;
  updated_at: string;
  timeline: TransferTimelineEvent[];
  communications: CommunicationLog[];
}

export interface TransferTimelineEvent {
  status: TransferStatus;
  label: string;
  completed_at: string | null;
  estimated_completion: string | null;
  notes: string | null;
}

export interface CommunicationLog {
  id: number;
  timestamp: string;
  type: 'sms' | 'email' | 'internal_note';
  direction: 'outbound' | 'inbound' | 'internal';
  message: string;
}

const now = new Date();
const dayMs = 86400000;

function daysAgo(n: number): string {
  return new Date(now.getTime() - n * dayMs).toISOString();
}

function hoursAgo(n: number): string {
  return new Date(now.getTime() - n * 3600000).toISOString();
}

function daysFromNow(n: number): string {
  return new Date(now.getTime() + n * dayMs).toISOString();
}

const sampleTransfers: Transfer[] = [
  {
    id: 1,
    email: 'sarah.m@example.com',
    phone: '(555) 234-5678',
    medication_name: 'Humira (adalimumab)',
    insurance_type: 'commercial',
    state: 'TX',
    current_pharmacy_name: 'CVS Specialty #4821',
    current_pharmacy_phone: '(800) 555-0101',
    prescriber_name: 'Dr. Rebecca Chen',
    prescriber_phone: '(214) 555-0199',
    current_dose: '40mg every 2 weeks',
    date_of_birth: '1985-03-14',
    insurance_provider: 'Blue Cross Blue Shield of Texas',
    member_id: 'BCB882991045',
    consent_given: true,
    status: 'submitted',
    estimated_savings: 'Up to $20,000/yr',
    created_at: hoursAgo(3),
    updated_at: hoursAgo(3),
    timeline: [
      { status: 'submitted', label: 'Request received', completed_at: hoursAgo(3), estimated_completion: null, notes: 'Transfer request submitted via web portal' },
      { status: 'eligibility_verified', label: 'Eligibility verified', completed_at: null, estimated_completion: hoursAgo(-2), notes: null },
      { status: 'pharmacy_contacted', label: 'Pharmacy contacted', completed_at: null, estimated_completion: daysFromNow(1), notes: null },
      { status: 'prescriber_contacted', label: 'Prescriber confirmation', completed_at: null, estimated_completion: daysFromNow(3), notes: null },
      { status: 'pa_initiated', label: 'Prior authorization', completed_at: null, estimated_completion: daysFromNow(7), notes: null },
      { status: 'pa_approved', label: 'PA approved', completed_at: null, estimated_completion: daysFromNow(7), notes: null },
      { status: 'transfer_complete', label: 'Transfer complete', completed_at: null, estimated_completion: daysFromNow(8), notes: null },
      { status: 'first_fill_shipped', label: 'First fill shipped', completed_at: null, estimated_completion: daysFromNow(10), notes: null },
    ],
    communications: [
      { id: 1, timestamp: hoursAgo(3), type: 'sms', direction: 'outbound', message: 'Hi Sarah! Your prescription transfer request has been received. We\'ll verify your eligibility within 2 hours. - VITAL Health' },
      { id: 2, timestamp: hoursAgo(3), type: 'email', direction: 'outbound', message: 'Transfer request confirmation for Humira. Reference #VH-2026-001. You can check your status anytime at vitalhealthrx.com/transfer/status' },
    ],
  },
  {
    id: 2,
    email: 'james.r@example.com',
    phone: '(555) 876-5432',
    medication_name: 'Rinvoq (upadacitinib)',
    insurance_type: 'commercial',
    state: 'CA',
    current_pharmacy_name: 'Walgreens Specialty',
    current_pharmacy_phone: '(800) 555-0202',
    prescriber_name: 'Dr. Michael Torres',
    prescriber_phone: '(310) 555-0188',
    current_dose: '15mg daily',
    date_of_birth: '1972-09-22',
    insurance_provider: 'Aetna',
    member_id: 'AET773201987',
    consent_given: true,
    status: 'pa_initiated',
    estimated_savings: 'Up to $16,000/yr',
    created_at: daysAgo(5),
    updated_at: daysAgo(1),
    timeline: [
      { status: 'submitted', label: 'Request received', completed_at: daysAgo(5), estimated_completion: null, notes: 'Transfer request submitted via web portal' },
      { status: 'eligibility_verified', label: 'Eligibility verified', completed_at: daysAgo(5), estimated_completion: null, notes: 'AbbVie Complete copay card eligibility confirmed. $0 copay estimated.' },
      { status: 'pharmacy_contacted', label: 'Pharmacy contacted', completed_at: daysAgo(4), estimated_completion: null, notes: 'Walgreens Specialty confirmed current Rx on file. Transfer initiated.' },
      { status: 'prescriber_contacted', label: 'Prescriber confirmation', completed_at: daysAgo(3), estimated_completion: null, notes: 'Dr. Torres office confirmed prescription. New Rx faxed to VITAL.' },
      { status: 'pa_initiated', label: 'Prior authorization', completed_at: null, estimated_completion: daysFromNow(2), notes: 'PA submitted to Aetna. Avg turnaround 3-5 business days.' },
      { status: 'pa_approved', label: 'PA approved', completed_at: null, estimated_completion: daysFromNow(3), notes: null },
      { status: 'transfer_complete', label: 'Transfer complete', completed_at: null, estimated_completion: daysFromNow(4), notes: null },
      { status: 'first_fill_shipped', label: 'First fill shipped', completed_at: null, estimated_completion: daysFromNow(5), notes: null },
    ],
    communications: [
      { id: 3, timestamp: daysAgo(5), type: 'sms', direction: 'outbound', message: 'Hi James! Your prescription transfer request has been received. We\'ll verify your eligibility within 2 hours. - VITAL Health' },
      { id: 4, timestamp: daysAgo(5), type: 'sms', direction: 'outbound', message: 'Great news! You\'re eligible for $0 copay on Rinvoq through AbbVie Complete. We\'re contacting your pharmacy now. - VITAL Health' },
      { id: 5, timestamp: daysAgo(4), type: 'sms', direction: 'outbound', message: 'Update: We\'ve contacted Walgreens Specialty and your prescription transfer is in progress. Next step: prescriber confirmation. - VITAL Health' },
      { id: 6, timestamp: daysAgo(3), type: 'sms', direction: 'outbound', message: 'Dr. Torres has confirmed your prescription. We\'re now submitting your prior authorization to Aetna. This typically takes 3-5 business days. - VITAL Health' },
      { id: 7, timestamp: daysAgo(1), type: 'internal_note', direction: 'internal', message: 'PA submitted to Aetna via CoverMyMeds. Reference #CMM-88291. Follow up in 3 business days if no response.' },
    ],
  },
  {
    id: 3,
    email: 'maria.g@example.com',
    phone: '(555) 345-6789',
    medication_name: 'Enbrel (etanercept)',
    insurance_type: 'commercial',
    state: 'FL',
    current_pharmacy_name: 'Optum Specialty',
    current_pharmacy_phone: '(800) 555-0303',
    prescriber_name: 'Dr. David Park',
    prescriber_phone: '(305) 555-0177',
    current_dose: '50mg weekly',
    date_of_birth: '1968-12-01',
    insurance_provider: 'UnitedHealthcare',
    member_id: 'UHC445209831',
    consent_given: true,
    status: 'transfer_complete',
    estimated_savings: 'Up to $12,000/yr',
    created_at: daysAgo(14),
    updated_at: daysAgo(1),
    timeline: [
      { status: 'submitted', label: 'Request received', completed_at: daysAgo(14), estimated_completion: null, notes: 'Transfer request submitted via web portal' },
      { status: 'eligibility_verified', label: 'Eligibility verified', completed_at: daysAgo(14), estimated_completion: null, notes: 'Amgen FIRST STEP copay card eligibility confirmed. $0 copay.' },
      { status: 'pharmacy_contacted', label: 'Pharmacy contacted', completed_at: daysAgo(13), estimated_completion: null, notes: 'Optum Specialty confirmed Rx. Transfer initiated.' },
      { status: 'prescriber_contacted', label: 'Prescriber confirmation', completed_at: daysAgo(12), estimated_completion: null, notes: 'Dr. Park office faxed new Rx.' },
      { status: 'pa_initiated', label: 'Prior authorization', completed_at: daysAgo(8), estimated_completion: null, notes: 'PA submitted to UHC.' },
      { status: 'pa_approved', label: 'PA approved', completed_at: daysAgo(5), estimated_completion: null, notes: 'PA approved by UnitedHealthcare. Valid for 12 months.' },
      { status: 'transfer_complete', label: 'Transfer complete', completed_at: daysAgo(3), estimated_completion: null, notes: 'Prescription transferred to VITAL Health pharmacy.' },
      { status: 'first_fill_shipped', label: 'First fill shipped', completed_at: daysAgo(1), estimated_completion: null, notes: 'First fill shipped via FedEx Priority Overnight. Tracking: 7891234567890.' },
    ],
    communications: [
      { id: 8, timestamp: daysAgo(14), type: 'sms', direction: 'outbound', message: 'Hi Maria! Your prescription transfer request has been received. We\'ll verify your eligibility within 2 hours. - VITAL Health' },
      { id: 9, timestamp: daysAgo(14), type: 'sms', direction: 'outbound', message: 'Great news! You\'re eligible for $0 copay on Enbrel through Amgen FIRST STEP. We\'re contacting your pharmacy now. - VITAL Health' },
      { id: 10, timestamp: daysAgo(13), type: 'sms', direction: 'outbound', message: 'Update: Optum Specialty is processing your transfer. Next step: prescriber confirmation. - VITAL Health' },
      { id: 11, timestamp: daysAgo(12), type: 'sms', direction: 'outbound', message: 'Dr. Park has confirmed your prescription. Submitting prior authorization now. - VITAL Health' },
      { id: 12, timestamp: daysAgo(5), type: 'sms', direction: 'outbound', message: 'Your prior authorization has been APPROVED by UnitedHealthcare! We\'re finalizing your transfer now. - VITAL Health' },
      { id: 13, timestamp: daysAgo(1), type: 'sms', direction: 'outbound', message: 'Your Enbrel has shipped! FedEx Priority Overnight tracking: 7891234567890. Expected delivery: tomorrow by 10:30am. - VITAL Health' },
    ],
  },
];

// Mutable store persisted across hot reloads
const globalStore = globalThis as unknown as {
  __mockTransfers?: Transfer[];
  __mockNextTransferId?: number;
};

if (!globalStore.__mockTransfers) {
  globalStore.__mockTransfers = [...sampleTransfers];
  globalStore.__mockNextTransferId = 4;
}

export function getTransfers(): Transfer[] {
  return globalStore.__mockTransfers!;
}

export function getTransferByEmail(email: string): Transfer | undefined {
  return globalStore.__mockTransfers!.find(
    (t) => t.email.toLowerCase() === email.toLowerCase()
  );
}

export function getTransferById(id: number): Transfer | undefined {
  return globalStore.__mockTransfers!.find((t) => t.id === id);
}

export function createTransfer(data: {
  email: string;
  phone: string;
  medication_name: string;
  insurance_type: string;
  state: string;
  current_pharmacy_name: string;
  current_pharmacy_phone: string;
  prescriber_name: string;
  prescriber_phone: string;
  current_dose: string;
  date_of_birth: string;
  insurance_provider: string;
  member_id: string;
  estimated_savings: string;
}): Transfer {
  const id = globalStore.__mockNextTransferId!++;
  const created_at = new Date().toISOString();

  const transfer: Transfer = {
    id,
    ...data,
    consent_given: true,
    status: 'submitted',
    created_at,
    updated_at: created_at,
    timeline: [
      { status: 'submitted', label: 'Request received', completed_at: created_at, estimated_completion: null, notes: 'Transfer request submitted via web portal' },
      { status: 'eligibility_verified', label: 'Eligibility verified', completed_at: null, estimated_completion: new Date(Date.now() + 2 * 3600000).toISOString(), notes: null },
      { status: 'pharmacy_contacted', label: 'Pharmacy contacted', completed_at: null, estimated_completion: new Date(Date.now() + dayMs).toISOString(), notes: null },
      { status: 'prescriber_contacted', label: 'Prescriber confirmation', completed_at: null, estimated_completion: new Date(Date.now() + 3 * dayMs).toISOString(), notes: null },
      { status: 'pa_initiated', label: 'Prior authorization', completed_at: null, estimated_completion: new Date(Date.now() + 7 * dayMs).toISOString(), notes: null },
      { status: 'pa_approved', label: 'PA approved', completed_at: null, estimated_completion: new Date(Date.now() + 7 * dayMs).toISOString(), notes: null },
      { status: 'transfer_complete', label: 'Transfer complete', completed_at: null, estimated_completion: new Date(Date.now() + 8 * dayMs).toISOString(), notes: null },
      { status: 'first_fill_shipped', label: 'First fill shipped', completed_at: null, estimated_completion: new Date(Date.now() + 10 * dayMs).toISOString(), notes: null },
    ],
    communications: [
      {
        id: Date.now(),
        timestamp: created_at,
        type: 'sms',
        direction: 'outbound',
        message: `Hi! Your prescription transfer request has been received. We'll verify your eligibility within 2 hours. - VITAL Health`,
      },
    ],
  };

  globalStore.__mockTransfers!.unshift(transfer);
  return transfer;
}

export function updateTransferStatus(
  id: number,
  newStatus: TransferStatus,
  notes?: string
): Transfer | null {
  const transfer = globalStore.__mockTransfers!.find((t) => t.id === id);
  if (!transfer) return null;

  transfer.status = newStatus;
  transfer.updated_at = new Date().toISOString();

  const timelineEvent = transfer.timeline.find((e) => e.status === newStatus);
  if (timelineEvent) {
    timelineEvent.completed_at = new Date().toISOString();
    if (notes) timelineEvent.notes = notes;
  }

  return transfer;
}

export const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
];
