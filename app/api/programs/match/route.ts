import { NextRequest, NextResponse } from "next/server";
import { supabase, usesMockData } from "@/lib/supabase";
import { programs as mockPrograms } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const medicationId = request.nextUrl.searchParams.get("medication_id");
  const insuranceType = request.nextUrl.searchParams.get("insurance_type");

  if (!medicationId || !insuranceType) {
    return NextResponse.json(
      { error: "medication_id and insurance_type are required" },
      { status: 400 }
    );
  }

  const medId = parseInt(medicationId);
  const statusOrder: Record<string, number> = { open: 0, waitlist: 1, closed: 2 };

  if (usesMockData) {
    const matched = mockPrograms
      .filter(
        (p) =>
          p.medication_id === medId &&
          p.eligible_insurance_types.includes(insuranceType)
      )
      .sort((a, b) => (statusOrder[a.fund_status] ?? 3) - (statusOrder[b.fund_status] ?? 3))
      .map(({ id, program_name, program_type, estimated_monthly_savings, estimated_annual_savings, likelihood_can_help, eligibility_summary, fund_status }) => ({
        id,
        program_name,
        program_type,
        estimated_monthly_savings,
        estimated_annual_savings,
        likelihood_can_help,
        eligibility_summary,
        fund_status,
      }));
    return NextResponse.json(matched);
  }

  const { data, error } = await supabase
    .from("medication_assistance_programs")
    .select(
      "id, program_name, program_type, estimated_monthly_savings, estimated_annual_savings, likelihood_can_help, eligibility_summary, fund_status, eligible_insurance_types"
    )
    .eq("medication_id", medId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const matched = (data || [])
    .filter((program) => {
      const types = program.eligible_insurance_types as string[];
      return types.includes(insuranceType);
    })
    .sort((a, b) => (statusOrder[a.fund_status] ?? 3) - (statusOrder[b.fund_status] ?? 3))
    .map(({ eligible_insurance_types, ...rest }) => rest);

  return NextResponse.json(matched);
}
