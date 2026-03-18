import { NextRequest, NextResponse } from "next/server";
import { supabase, usesMockData } from "@/lib/supabase";
import {
  medications as mockMeds,
  programs as mockPrograms,
  inquiries as mockInquiries,
  addInquiry,
} from "@/lib/mock-data";

const VALID_INSURANCE_TYPES = [
  "commercial",
  "medicare_d",
  "medicaid",
  "uninsured",
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    first_name,
    email,
    phone,
    state_of_residence,
    insurance_type,
    medication_id,
    matched_program_ids,
  } = body;

  if (!first_name || !email || !phone || !state_of_residence || !insurance_type || !medication_id) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  if (!VALID_INSURANCE_TYPES.includes(insurance_type)) {
    return NextResponse.json(
      { error: "Invalid insurance_type" },
      { status: 400 }
    );
  }

  if (usesMockData) {
    const med = mockMeds.find((m) => m.id === medication_id);
    if (!med) {
      return NextResponse.json({ error: "Medication not found" }, { status: 400 });
    }
    const inquiry = addInquiry({
      first_name,
      email,
      phone,
      state_of_residence,
      insurance_type,
      medication_id,
      matched_program_ids: matched_program_ids || [],
    });
    return NextResponse.json(
      { id: inquiry.id, created_at: inquiry.created_at },
      { status: 201 }
    );
  }

  // Verify medication exists
  const { data: med } = await supabase
    .from("medications")
    .select("id")
    .eq("id", medication_id)
    .single();

  if (!med) {
    return NextResponse.json({ error: "Medication not found" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("copay_inquiries")
    .insert({
      first_name,
      email,
      phone,
      state_of_residence,
      insurance_type,
      medication_id,
      matched_program_ids: matched_program_ids || [],
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
    const enriched = mockInquiries.map((inq) => {
      const med = mockMeds.find((m) => m.id === inq.medication_id);
      const matchedPrograms = (inq.matched_program_ids || [])
        .map((pid) => {
          const p = mockPrograms.find((pr) => pr.id === pid);
          return p ? { program_name: p.program_name, fund_status: p.fund_status } : null;
        })
        .filter(Boolean);

      return {
        ...inq,
        medication_name: med?.generic_name || "Unknown",
        medication_brands: med?.brand_names || [],
        matched_programs: matchedPrograms,
      };
    });
    return NextResponse.json(enriched);
  }

  const { data: inquiries, error } = await supabase
    .from("copay_inquiries")
    .select("*, medications(generic_name, brand_names)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const allProgramIds = (inquiries || []).flatMap(
    (inq) => (inq.matched_program_ids as number[]) || []
  );
  const uniqueProgramIds = Array.from(new Set(allProgramIds));

  let programMap: Record<number, { program_name: string; fund_status: string }> = {};

  if (uniqueProgramIds.length > 0) {
    const { data: programs } = await supabase
      .from("medication_assistance_programs")
      .select("id, program_name, fund_status")
      .in("id", uniqueProgramIds);

    if (programs) {
      programMap = Object.fromEntries(
        programs.map((p) => [p.id, { program_name: p.program_name, fund_status: p.fund_status }])
      );
    }
  }

  const enriched = (inquiries || []).map((inq) => {
    const programIds = (inq.matched_program_ids as number[]) || [];
    const matched_programs = programIds
      .map((pid) => programMap[pid])
      .filter(Boolean);

    return {
      ...inq,
      medication_name: inq.medications?.generic_name || "Unknown",
      medication_brands: inq.medications?.brand_names || [],
      matched_programs,
    };
  });

  return NextResponse.json(enriched);
}
