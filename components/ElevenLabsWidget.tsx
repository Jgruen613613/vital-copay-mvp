"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Script from "next/script";

const AGENT_ID = "agent_0001kkf2z3t2e2svmjvqjef";

export function ElevenLabsWidget() {
  const pathname = usePathname();
  const [scriptReady, setScriptReady] = useState(false);
  const [showWidget, setShowWidget] = useState(false);

  // Listen for custom event from "Talk to Specialist" button
  useEffect(() => {
    function handleOpen() {
      setShowWidget(true);
    }
    window.addEventListener("open-elevenlabs", handleOpen);
    return () => window.removeEventListener("open-elevenlabs", handleOpen);
  }, []);

  // Check if the script was already loaded
  useEffect(() => {
    if (customElements.get("elevenlabs-convai")) {
      setScriptReady(true);
    }
  }, []);

  // Mount / unmount the widget element on the body
  useEffect(() => {
    if (!showWidget || !scriptReady) return;

    const el = document.createElement("elevenlabs-convai");
    el.setAttribute("agent-id", AGENT_ID);
    document.body.appendChild(el);

    return () => {
      el.remove();
    };
  }, [showWidget, scriptReady]);

  // Do not show on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@elevenlabs/convai-widget-embed@0.3.0/dist/bundle.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => {
          const s = document.createElement("script");
          s.src = "https://unpkg.com/@elevenlabs/convai-widget-embed@0.3.0";
          s.async = true;
          s.onload = () => setScriptReady(true);
          document.head.appendChild(s);
        }}
      />

      {/* Floating button — bottom-right */}
      <button
        onClick={() => setShowWidget(!showWidget)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#1a365d] text-white rounded-full shadow-lg hover:bg-[#2a4a7f] transition-colors flex items-center justify-center group"
        aria-label="Talk to Sarah"
        title="Talk to Sarah"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Talk to Sarah
        </span>
      </button>
    </>
  );
}
