"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    pollfishConfig?: {
      api_key: string;
      debug?: boolean;
      ready?: () => void;
      closeCallback?: () => void;
      userNotEligibleCallback?: () => void;
      surveyCompletedCallback?: (data: unknown) => void;
      surveyAvailable?: (data: unknown) => void;
    };
    Pollfish?: {
      showFullSurvey: () => void;
      showIndicator: () => void;
      hideIndicator: () => void;
    };
  }
}

export function PollfishSurvey() {
  const [surveyReady, setSurveyReady] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_POLLFISH_API_KEY;

  useEffect(() => {
    if (!apiKey || sdkLoaded) return;

    window.pollfishConfig = {
      api_key: apiKey,
      debug: process.env.NODE_ENV !== "production",
      ready: () => {
        setSurveyReady(true);
      },
      closeCallback: () => {},
      userNotEligibleCallback: () => {
        setSurveyReady(false);
      },
      surveyCompletedCallback: () => {
        setSurveyCompleted(true);
      },
      surveyAvailable: () => {
        setSurveyReady(true);
      },
    };

    const script = document.createElement("script");
    script.src =
      "https://storage.googleapis.com/pollfish_production/sdk/webplugin/pollfish.min.js";
    script.async = true;
    script.onload = () => setSdkLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      delete window.pollfishConfig;
    };
  }, [apiKey, sdkLoaded]);

  const handleTakeSurvey = () => {
    if (window.Pollfish) {
      window.Pollfish.showFullSurvey();
    }
  };

  return (
    <section id="survey" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Help Us Improve Medication Access
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Take a quick 3-minute survey about your experience with specialty
          medication costs. Your anonymous feedback helps us build better copay
          assistance programs.
        </p>

        {surveyCompleted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-green-600 text-4xl mb-3">&#10003;</div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Thank You!
            </h3>
            <p className="text-green-700">
              Your feedback helps us connect more patients with savings
              programs.
            </p>
          </div>
        ) : !apiKey ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-blue-800 text-sm">
              Survey coming soon. Set{" "}
              <code className="bg-blue-100 px-1 rounded">
                NEXT_PUBLIC_POLLFISH_API_KEY
              </code>{" "}
              in your environment to enable.
            </p>
          </div>
        ) : (
          <button
            onClick={handleTakeSurvey}
            disabled={!surveyReady}
            className={`inline-flex items-center px-8 py-4 rounded-lg text-lg font-semibold transition-all ${
              surveyReady
                ? "bg-[#1a365d] text-white hover:bg-[#2a4a7f] shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {surveyReady ? (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                Take the Survey
              </>
            ) : (
              "Loading Survey..."
            )}
          </button>
        )}

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-gray-50 rounded-lg p-5">
            <div className="text-2xl mb-2">&#128274;</div>
            <h4 className="font-semibold text-gray-900 mb-1">100% Anonymous</h4>
            <p className="text-sm text-gray-600">
              No personal health information is collected or stored.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-5">
            <div className="text-2xl mb-2">&#9201;</div>
            <h4 className="font-semibold text-gray-900 mb-1">3 Minutes</h4>
            <p className="text-sm text-gray-600">
              Quick and easy — just 15 questions about medication costs.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-5">
            <div className="text-2xl mb-2">&#128161;</div>
            <h4 className="font-semibold text-gray-900 mb-1">
              Shape the Future
            </h4>
            <p className="text-sm text-gray-600">
              Your input directly improves copay assistance for patients.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
