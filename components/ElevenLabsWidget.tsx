"use client";

import { usePathname } from "next/navigation";

export function ElevenLabsWidget() {
  const pathname = usePathname();

  // Do not show on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* ElevenLabs agent embed — replace AGENT_ID with actual value */}
      {/*
        To activate, replace this placeholder with your ElevenLabs embed script:
        <script src="https://elevenlabs.io/convai-widget/index.js"
                data-agent-id={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}
                async />
        Widget position: Bottom-right floating button (standard ElevenLabs positioning)
      */}
      <div id="elevenlabs-widget" data-agent-id={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID} />
    </>
  );
}
