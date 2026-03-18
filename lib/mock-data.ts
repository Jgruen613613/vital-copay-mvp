// In-memory mock data for local development without Supabase

export interface Medication {
  id: number;
  generic_name: string;
  brand_names: string[];
  drug_class: string;
  route_of_administration: string;
  is_biologic: boolean;
  is_biosimilar: boolean;
  average_wac_monthly: number | null;
  created_at: string;
}

export interface Program {
  id: number;
  medication_id: number;
  program_name: string;
  program_type: string;
  eligible_insurance_types: string[];
  eligibility_summary: string;
  estimated_monthly_savings: string;
  estimated_annual_savings: string;
  likelihood_can_help: string;
  fund_status: string;
  fund_status_last_checked: string | null;
  application_url: string | null;
  application_method: string | null;
  renewal_frequency: string | null;
  source: string;
  created_at: string;
}

export interface CopayInquiry {
  id: number;
  email: string;
  preferred_call_time: string | null;
  insurance_type: string | null;
  consent_to_contact: boolean;
  status: string;
  specialist_notes: string | null;
  created_at: string;
}

export interface WaitlistSignup {
  id: number;
  email: string;
  source: string;
  created_at: string;
}

const now = new Date().toISOString();

export const medications: Medication[] = [
  { id: 1, generic_name: "adalimumab", brand_names: ["Humira","Hadlima","Hyrimoz","Cyltezo"], drug_class: "TNF inhibitor", route_of_administration: "subcutaneous_injection", is_biologic: true, is_biosimilar: false, average_wac_monthly: null, created_at: now },
  { id: 2, generic_name: "etanercept", brand_names: ["Enbrel","Erelzi","Eticovo"], drug_class: "TNF inhibitor", route_of_administration: "subcutaneous_injection", is_biologic: true, is_biosimilar: false, average_wac_monthly: null, created_at: now },
  { id: 3, generic_name: "tofacitinib", brand_names: ["Xeljanz","Xeljanz XR"], drug_class: "JAK inhibitor", route_of_administration: "oral", is_biologic: false, is_biosimilar: false, average_wac_monthly: null, created_at: now },
  { id: 4, generic_name: "upadacitinib", brand_names: ["Rinvoq"], drug_class: "JAK inhibitor", route_of_administration: "oral", is_biologic: false, is_biosimilar: false, average_wac_monthly: null, created_at: now },
  { id: 5, generic_name: "secukinumab", brand_names: ["Cosentyx"], drug_class: "IL-17A inhibitor", route_of_administration: "subcutaneous_injection", is_biologic: true, is_biosimilar: false, average_wac_monthly: null, created_at: now },
];

export const programs: Program[] = [
  { id: 1, medication_id: 1, program_name: "AbbVie Complete", program_type: "copay_card", eligible_insurance_types: ["commercial"], eligibility_summary: "Commercially insured patients. Not for government insurance.", estimated_monthly_savings: "$0 copay", estimated_annual_savings: "Up to $20,000/yr", likelihood_can_help: "98-95%", fund_status: "open", fund_status_last_checked: null, application_url: null, application_method: null, renewal_frequency: null, source: "manual", created_at: now },
  { id: 2, medication_id: 1, program_name: "AbbVie myAbbVie Assist", program_type: "pap", eligible_insurance_types: ["uninsured"], eligibility_summary: "Uninsured or income ≤400% FPL.", estimated_monthly_savings: "Free medication", estimated_annual_savings: "Full cost covered", likelihood_can_help: "90-95%", fund_status: "open", fund_status_last_checked: null, application_url: null, application_method: null, renewal_frequency: null, source: "manual", created_at: now },
  { id: 3, medication_id: 1, program_name: "PAN Foundation — RA", program_type: "foundation_grant", eligible_insurance_types: ["medicare","dual_eligible"], eligibility_summary: "Medicare patients. Income ≤500% FPL.", estimated_monthly_savings: "Up to $625/mo", estimated_annual_savings: "Up to $7,500/yr", likelihood_can_help: "85-90%", fund_status: "waitlist", fund_status_last_checked: null, application_url: null, application_method: null, renewal_frequency: null, source: "manual", created_at: now },
  { id: 4, medication_id: 2, program_name: "Amgen FIRST STEP", program_type: "copay_card", eligible_insurance_types: ["commercial"], eligibility_summary: "Commercially insured. Not for government insurance.", estimated_monthly_savings: "$0 copay", estimated_annual_savings: "Up to $12,000/yr", likelihood_can_help: "98-95%", fund_status: "open", fund_status_last_checked: null, application_url: null, application_method: null, renewal_frequency: null, source: "manual", created_at: now },
  { id: 5, medication_id: 2, program_name: "Amgen Safety Net Foundation", program_type: "pap", eligible_insurance_types: ["uninsured"], eligibility_summary: "Uninsured or underinsured.", estimated_monthly_savings: "Free medication", estimated_annual_savings: "Full cost covered", likelihood_can_help: "90-95%", fund_status: "open", fund_status_last_checked: null, application_url: null, application_method: null, renewal_frequency: null, source: "manual", created_at: now },
  { id: 6, medication_id: 3, program_name: "Pfizer enCompass", program_type: "copay_card", eligible_insurance_types: ["commercial"], eligibility_summary: "Commercially insured.", estimated_monthly_savings: "$0 copay", estimated_annual_savings: "Up to $15,000/yr", likelihood_can_help: "98-95%", fund_status: "open", fund_status_last_checked: null, application_url: null, application_method: null, renewal_frequency: null, source: "manual", created_at: now },
  { id: 7, medication_id: 3, program_name: "Pfizer RxPathways", program_type: "pap", eligible_insurance_types: ["uninsured"], eligibility_summary: "Uninsured or income ≤400% FPL.", estimated_monthly_savings: "Free medication", estimated_annual_savings: "Full cost covered", likelihood_can_help: "90-95%", fund_status: "open", fund_status_last_checked: null, application_url: null, application_method: null, renewal_frequency: null, source: "manual", created_at: now },
  { id: 8, medication_id: 4, program_name: "AbbVie Complete (Rinvoq)", program_type: "copay_card", eligible_insurance_types: ["commercial"], eligibility_summary: "Commercially insured.", estimated_monthly_savings: "$0 copay", estimated_annual_savings: "Up to $16,000/yr", likelihood_can_help: "98-95%", fund_status: "open", fund_status_last_checked: null, application_url: null, application_method: null, renewal_frequency: null, source: "manual", created_at: now },
  { id: 9, medication_id: 4, program_name: "HealthWell Foundation — RA", program_type: "foundation_grant", eligible_insurance_types: ["medicare","dual_eligible"], eligibility_summary: "Medicare patients. Income ≤500% FPL.", estimated_monthly_savings: "Up to $833/mo", estimated_annual_savings: "Up to $10,000/yr", likelihood_can_help: "85-90%", fund_status: "open", fund_status_last_checked: null, application_url: null, application_method: null, renewal_frequency: null, source: "manual", created_at: now },
  { id: 10, medication_id: 5, program_name: "Novartis CoPay Card", program_type: "copay_card", eligible_insurance_types: ["commercial"], eligibility_summary: "Commercially insured.", estimated_monthly_savings: "$0 copay", estimated_annual_savings: "Up to $16,000/yr", likelihood_can_help: "98-95%", fund_status: "open", fund_status_last_checked: null, application_url: null, application_method: null, renewal_frequency: null, source: "manual", created_at: now },
  { id: 11, medication_id: 5, program_name: "Novartis PAP", program_type: "pap", eligible_insurance_types: ["uninsured"], eligibility_summary: "Uninsured or income ≤400% FPL.", estimated_monthly_savings: "Free medication", estimated_annual_savings: "Full cost covered", likelihood_can_help: "90-95%", fund_status: "open", fund_status_last_checked: null, application_url: null, application_method: null, renewal_frequency: null, source: "manual", created_at: now },
  { id: 12, medication_id: 5, program_name: "CARF — Autoimmune", program_type: "foundation_grant", eligible_insurance_types: ["medicare","dual_eligible"], eligibility_summary: "Medicare. Currently closed to new enrollees.", estimated_monthly_savings: "Up to $750/mo", estimated_annual_savings: "Up to $9,000/yr", likelihood_can_help: "85-90%", fund_status: "closed", fund_status_last_checked: null, application_url: null, application_method: null, renewal_frequency: null, source: "manual", created_at: now },
];

// Mutable stores — persisted across hot reloads via globalThis
const globalStore = globalThis as unknown as {
  __mockInquiries?: CopayInquiry[];
  __mockNextInquiryId?: number;
  __mockWaitlist?: WaitlistSignup[];
  __mockNextWaitlistId?: number;
};

if (!globalStore.__mockInquiries) {
  globalStore.__mockInquiries = [];
  globalStore.__mockNextInquiryId = 1;
}
if (!globalStore.__mockWaitlist) {
  globalStore.__mockWaitlist = [];
  globalStore.__mockNextWaitlistId = 1;
}

export const inquiries = globalStore.__mockInquiries;
export const waitlistSignups = globalStore.__mockWaitlist;

export function addInquiry(data: { email: string; preferred_call_time?: string | null; insurance_type?: string | null; consent_to_contact: boolean }): CopayInquiry {
  const inquiry: CopayInquiry = {
    id: globalStore.__mockNextInquiryId!++,
    email: data.email,
    preferred_call_time: data.preferred_call_time || null,
    insurance_type: data.insurance_type || null,
    consent_to_contact: data.consent_to_contact,
    status: "new",
    specialist_notes: null,
    created_at: new Date().toISOString(),
  };
  inquiries.unshift(inquiry);
  return inquiry;
}

export function updateInquiry(id: number, updates: { status?: string; specialist_notes?: string }): CopayInquiry | null {
  const idx = inquiries.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  if (updates.status) inquiries[idx].status = updates.status;
  if (updates.specialist_notes !== undefined) inquiries[idx].specialist_notes = updates.specialist_notes;
  return inquiries[idx];
}

export function addWaitlistSignup(email: string, source: string = "coming_soon_page"): WaitlistSignup {
  const signup: WaitlistSignup = {
    id: globalStore.__mockNextWaitlistId!++,
    email,
    source,
    created_at: new Date().toISOString(),
  };
  waitlistSignups.unshift(signup);
  return signup;
}
