import { NextResponse } from "next/server";

export async function GET() {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    console.error("[elevenlabs-signed-url] ELEVENLABS_API_KEY env var is missing");
    return NextResponse.json(
      { error: "ElevenLabs API key not configured" },
      { status: 500 }
    );
  }

  if (!agentId) {
    console.error("[elevenlabs-signed-url] NEXT_PUBLIC_ELEVENLABS_AGENT_ID env var is missing");
    return NextResponse.json(
      { error: "ElevenLabs agent ID not configured" },
      { status: 500 }
    );
  }

  const url = `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`;

  try {
    const res = await fetch(url, {
      headers: { "xi-api-key": apiKey },
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[elevenlabs-signed-url] API error:", res.status, JSON.stringify(data));
      return NextResponse.json(
        { error: "Failed to get signed URL", detail: data },
        { status: res.status }
      );
    }

    if (!data.signed_url) {
      console.error("[elevenlabs-signed-url] No signed_url in response:", JSON.stringify(data));
      return NextResponse.json(
        { error: "No signed URL in response", detail: data },
        { status: 502 }
      );
    }

    return NextResponse.json({ signed_url: data.signed_url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[elevenlabs-signed-url] Fetch failed:", message);
    return NextResponse.json(
      { error: "Could not reach ElevenLabs API", detail: message },
      { status: 502 }
    );
  }
}
