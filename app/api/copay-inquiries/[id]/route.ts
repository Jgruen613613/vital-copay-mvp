import { NextRequest, NextResponse } from "next/server";
import { supabase, usesMockData } from "@/lib/supabase";
import { updateInquiry } from "@/lib/mock-data";

const VALID_STATUSES = ["new", "contacted", "enrolled", "closed"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();
  const { status, specialist_notes } = body;

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (usesMockData) {
    const updated = updateInquiry(id, { status, specialist_notes });
    if (!updated) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  }

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (specialist_notes !== undefined) updates.specialist_notes = specialist_notes;

  const { data, error } = await supabase
    .from("copay_inquiries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
