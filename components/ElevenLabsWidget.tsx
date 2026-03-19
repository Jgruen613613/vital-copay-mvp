"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";

function resolveAgentId(): string {
  const raw = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "0001kkf2z3t2e2svmjvqjef95tc3";
  // Strip "agent_" prefix if present — the widget adds it internally
  const bare = raw.startsWith("agent_") ? raw.slice(6) : raw;
  return bare;
}

const AGENT_ID = resolveAgentId();

export function ElevenLabsWidget() {
  const pathname = usePathname();
  const [showPopup, setShowPopup] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  // Listen for custom event from "Talk to Specialist" button
  useEffect(() => {
    function handleOpen() {
      setShowPopup(true);
    }
    window.addEventListener("open-elevenlabs", handleOpen);
    return () => window.removeEventListener("open-elevenlabs", handleOpen);
  }, []);

  // Check if the script was already loaded (e.g. cached from prior navigation)
  useEffect(() => {
    if (customElements.get("elevenlabs-convai")) {
      setScriptReady(true);
    }
  }, []);

  // Mount/remount the widget element whenever the popup opens AND the script is ready
  useEffect(() => {
    const container = widgetContainerRef.current;
    if (!showPopup || !scriptReady || !container || !AGENT_ID) return;

    // Clear any previous widget instance
    container.innerHTML = "";

    const el = document.createElement("elevenlabs-convai");
    el.setAttribute("agent-id", AGENT_ID);
    el.style.height = "100%";
    el.style.width = "100%";
    container.appendChild(el);

    // Cleanup on close
    return () => {
      container.innerHTML = "";
    };
  }, [showPopup, scriptReady]);

  // Do not show on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Load ElevenLabs Convai widget script early */}
      <Script
        src="https://elevenlabs.io/convai-widget/index.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

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
        <div className="fixed bottom-24 right-6 z-50 w-80 h-[480px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-[#1a365d] text-white px-4 py-3 flex items-center justify-between shrink-0">
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
          {scriptReady ? (
            <div ref={widgetContainerRef} className="flex-1 overflow-hidden" />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Loading voice agent...
            </div>
          )}
        </div>
      )}
    </>
  );
}
