import { NextRequest, NextResponse } from "next/server";

// In-memory store for transfers (mock data)
const transfers: any[] = [
  {
    id: 1,
    email: "sarah.m@example.com",
    phone: "555-0142",
    state: "CA",
    medication_name: "Humira (adalimumab)",
    current_dose: "40mg biweekly",
    prescriber_name: "Dr. Rebecca Chen",
    prescriber_phone: "555-0199",
    current_pharmacy_name: "CVS Specialty",
    insurance_type: "commercial",
    insurance_provider: "Blue Cross Blue Shield",
    member_id: "XWB928471",
    status: "pa_initiated",
    status_history: [
      { status: "submitted", at: "2026-03-18T10:30:00Z", note: "Patient submitted form" },
      { status: "eligibility_confirmed", at: "2026-03-18T11:15:00Z", note: "Qualified for AbbVie Complete — $0 copay" },
      { status: "transfer_requested", at: "2026-03-18T14:00:00Z", note: "Contacted CVS Specialty for prescription transfer" },
      { status: "prescriber_contacted", at: "2026-03-19T09:00:00Z", note: "Dr. Chen's office confirmed prescription" },
      { status: "pa_initiated", at: "2026-03-20T10:00:00Z", note: "Prior auth submitted to BCBS" },
    ],
    communications: [
      { type: "sms", at: "2026-03-18T10:31:00Z", message: "We've received your transfer request! We'll have an update within 2 hours." },
      { type: "sms", at: "2026-03-18T11:16:00Z", message: "Great news — you qualify for $0 copay through AbbVie Complete! We're contacting your pharmacy now." },
      { type: "sms", at: "2026-03-20T10:05:00Z", message: "Your prior authorization has been submitted to BCBS. Expected decision: 3-5 business days." },
    ],
    estimated_annual_savings: "$6,200",
    copay_program_matched: "AbbVie Complete",
    created_at: "2026-03-18T10:30:00Z",
    updated_at: "2026-03-20T10:00:00Z",
  },
  {
    id: 2,
    email: "mike.j@example.com",
    phone: "555-0188",
    state: "TX",
    medication_name: "Rinvoq (upadacitinib)",
    current_dose: "15mg daily",
    prescriber_name: "Dr. Alan Torres",
    current_pharmacy_name: "Accredo",
    insurance_type: "commercial",
    status: "transfer_complete",
    status_history: [
      { status: "submitted", at: "2026-03-10T08:00:00Z" },
      { status: "eligibility_confirmed", at: "2026-03-10T09:30:00Z" },
      { status: "transfer_requested", at: "2026-03-10T13:00:00Z" },
      { status: "prescriber_contacted", at: "2026-03-11T10:00:00Z" },
      { status: "pa_initiated", at: "2026-03-12T09:00:00Z" },
      { status: "pa_approved", at: "2026-03-15T14:00:00Z" },
      { status: "transfer_complete", at: "2026-03-16T10:00:00Z" },
      { status: "first_fill_shipped", at: "2026-03-17T08:00:00Z" },
    ],
    estimated_annual_savings: "$7,800",
    copay_program_matched: "AbbVie Complete Rinvoq",
    created_at: "2026-03-10T08:00:00Z",
    updated_at: "2026-03-17T08:00:00Z",
  },
  {
    id: 3,
    email: "jenny.k@example.com",
    state: "NY",
    medication_name: "Cosentyx (secukinumab)",
    insurance_type: "medicare",
    status: "submitted",
    status_history: [
      { status: "submitted", at: "2026-03-23T09:00:00Z", note: "Patient submitted form" },
    ],
    estimated_annual_savings: "$5,400",
    created_at: "2026-03-23T09:00:00Z",
    updated_at: "2026-03-23T09:00:00Z",
  },
];

let nextId = 4;

export async function GET() {
  return NextResponse.json(transfers.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ));
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.email || !body.medication_name || !body.state) {
    return NextResponse.json(
      { error: "Email, medication name, and state are required" },
      { status: 400 }
    );
  }

  const transfer = {
    id: nextId++,
    ...body,
    status: "submitted",
    status_history: [
      { status: "submitted", at: new Date().toISOString(), note: "Patient submitted form" },
    ],
    communications: [
      {
        type: "sms",
        at: new Date().toISOString(),
        message: "We've received your transfer request! We'll have an update within 2 hours.",
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  transfers.push(transfer);

  return NextResponse.json(transfer, { status: 201 });
}
