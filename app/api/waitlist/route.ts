import { NextRequest, NextResponse } from "next/server";
import { supabase, usesMockData } from "@/lib/supabase";
import { addWaitlistSignup } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  if (usesMockData) {
    const signup = addWaitlistSignup(email);
    return NextResponse.json(
      { id: signup.id, created_at: signup.created_at },
      { status: 201 }
    );
  }

  const { data, error } = await supabase
    .from("waitlist_signups")
    .insert({ email, source: "coming_soon_page" })
    .select("id, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
