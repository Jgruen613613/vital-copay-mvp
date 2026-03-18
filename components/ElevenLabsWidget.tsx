"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function ElevenLabsWidget() {
  const pathname = usePathname();
  const [showPopup, setShowPopup] = useState(false);

  // Listen for custom event from "Talk to Specialist" button
  useEffect(() => {
    function handleOpen() {
      setShowPopup(true);
    }
    window.addEventListener("open-elevenlabs", handleOpen);
    return () => window.removeEventListener("open-elevenlabs", handleOpen);
  }, []);

  // Do not show on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Floating button — bottom-right */}
      <button
        onClick={() => setShowPopup(!showPopup)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#1a365d] text-white rounded-full shadow-lg hover:bg-[#2a4a7f] transition-colors flex items-center justify-center group"
        aria-label="Talk to Sarah"
        title="Talk to Sarah"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        {/* Tooltip */}
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Talk to Sarah
        </span>
      </button>

      {/* ElevenLabs widget popup */}
      {showPopup && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-[#1a365d] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium text-sm">Sarah &mdash; VITAL Specialist</span>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className="text-white/80 hover:text-white"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center text-center p-6">
            {/* ElevenLabs agent embed — replace with actual embed script */}
            {/*
              To activate, add the ElevenLabs Convai widget script here:
              <elevenlabs-convai agent-id={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}></elevenlabs-convai>
              <script src="https://elevenlabs.io/convai-widget/index.js" async type="text/javascript"></script>
            */}
            <div>
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#1a365d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="font-medium text-gray-900 mb-1">Voice Agent Coming Soon</p>
              <p className="text-sm text-gray-500">
                Replace this placeholder with your ElevenLabs agent embed
                (Agent ID: {process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "not configured"})
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
