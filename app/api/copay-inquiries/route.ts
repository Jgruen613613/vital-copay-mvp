import { NextRequest, NextResponse } from "next/server";
import { supabase, usesMockData } from "@/lib/supabase";
import { inquiries as mockInquiries, addInquiry } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, preferred_call_time, insurance_type, consent_to_contact } = body;

  // Validation
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  if (consent_to_contact !== true) {
    return NextResponse.json({ error: "Consent to contact is required" }, { status: 400 });
  }

  if (usesMockData) {
    const inquiry = addInquiry({
      email,
      preferred_call_time: preferred_call_time || null,
      insurance_type: insurance_type || null,
      consent_to_contact,
    });
    return NextResponse.json(
      { id: inquiry.id, created_at: inquiry.created_at },
      { status: 201 }
    );
  }

  const { data, error } = await supabase
    .from("copay_inquiries")
    .insert({
      email,
      preferred_call_time: preferred_call_time || null,
      insurance_type: insurance_type || null,
      consent_to_contact,
      status: "new",
    })
    .select("id, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function GET() {
  if (usesMockData) {
    return NextResponse.json(mockInquiries);
  }

  const { data, error } = await supabase
    .from("copay_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
