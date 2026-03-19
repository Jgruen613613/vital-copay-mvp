import { NextResponse } from "next/server";

const AGENT_ID =
  process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "agent_0001kkf2z3t2e2svnjvqjzf95tc3";
const API_KEY = process.env.ELEVENLABS_API_KEY;

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "ElevenLabs API key not configured" },
      { status: 500 }
    );
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${AGENT_ID}`,
    {
      headers: { "xi-api-key": API_KEY },
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to get signed URL" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json({ signed_url: data.signed_url });
}
