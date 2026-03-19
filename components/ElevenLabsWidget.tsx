"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";

export function ElevenLabsWidget() {
  const pathname = usePathname();
  const [showPopup, setShowPopup] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  // Fetch a signed URL from our server when the popup opens
  useEffect(() => {
    if (!showPopup) return;

    let cancelled = false;
    setError(null);
    setSignedUrl(null);

    async function fetchSignedUrl() {
      try {
        const res = await fetch("/api/elevenlabs-signed-url");
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled && data.signed_url) {
          setSignedUrl(data.signed_url);
        } else if (!cancelled) {
          throw new Error("No signed URL returned");
        }
      } catch (err) {
        if (!cancelled) {
          setError("Unable to connect to voice agent. Please try the callback option.");
        }
      }
    }

    fetchSignedUrl();
    return () => { cancelled = true; };
  }, [showPopup]);

  // Mount the widget once we have both the script and a signed URL
  useEffect(() => {
    const container = widgetContainerRef.current;
    if (!showPopup || !scriptReady || !signedUrl || !container) return;

    container.innerHTML = "";

    const el = document.createElement("elevenlabs-convai");
    el.setAttribute("signed-url", signedUrl);
    el.style.height = "100%";
    el.style.width = "100%";
    container.appendChild(el);

    return () => {
      container.innerHTML = "";
    };
  }, [showPopup, scriptReady, signedUrl]);

  // Do not show on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  // Determine loading state for the popup body
  const isLoading = !scriptReady || (!signedUrl && !error);

  return (
    <>
      {/* Load ElevenLabs Convai widget script */}
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
        onClick={() => setShowPopup(!showPopup)}
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

          {error ? (
            <div className="flex-1 flex items-center justify-center p-4 text-center">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : isLoading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Connecting to Sarah...
            </div>
          ) : (
            <div ref={widgetContainerRef} className="flex-1 overflow-hidden" />
          )}
        </div>
      )}
    </>
  );
}
