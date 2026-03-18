"use client";

import { useState, useEffect, useRef } from "react";

interface Medication {
  id: number;
  generic_name: string;
  brand_names: string[];
  drug_class: string;
}

interface Program {
  id: number;
  program_name: string;
  program_type: string;
  estimated_monthly_savings: string;
  estimated_annual_savings: string;
  likelihood_can_help: string;
  eligibility_summary: string;
  fund_status: string;
}

const INSURANCE_OPTIONS = [
  { value: "commercial", icon: "\uD83C\uDFE2", label: "Commercial / Employer-Sponsored", desc: "Insurance through your job or purchased privately" },
  { value: "medicare", icon: "\uD83C\uDFE5", label: "Medicare", desc: "Federal program, typically 65+" },
  { value: "medicaid", icon: "\uD83D\uDC99", label: "Medicaid", desc: "State-based program for qualifying individuals" },
  { value: "dual_eligible", icon: "\uD83C\uDFE5\uD83D\uDC99", label: "Medicare + Medicaid (Dual Eligible)", desc: "Both Medicare and Medicaid coverage" },
  { value: "uninsured", icon: "\uD83D\uDEAB", label: "Uninsured / Self-Pay", desc: "No insurance coverage" },
];

export function SavingsChecker() {
  const [step, setStep] = useState(1); // 1=medication, 2=insurance, 3=results
  const [medQuery, setMedQuery] = useState("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [insuranceType, setInsuranceType] = useState("");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [callbackEmail, setCallbackEmail] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [callbackConsent, setCallbackConsent] = useState(false);
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [callbackError, setCallbackError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const insuranceLabel: Record<string, string> = {
    commercial: "commercial",
    medicare: "Medicare",
    medicaid: "Medicaid",
    dual_eligible: "dual eligible",
    uninsured: "uninsured",
  };

  // Medication search
  useEffect(() => {
    if (medQuery.length < 2 || selectedMed) {
      setMedications([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/medications/search?query=${encodeURIComponent(medQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setMedications(data);
        setShowDropdown(true);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [medQuery, selectedMed]);

  // Click outside dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectMed(med: Medication) {
    setSelectedMed(med);
    setMedQuery(`${med.brand_names[0]} (${med.generic_name})`);
    setShowDropdown(false);
    setMedications([]);
  }

  function handleMedInputChange(value: string) {
    setMedQuery(value);
    setSelectedMed(null);
  }

  async function handleSeeResults() {
    if (!selectedMed || !insuranceType) return;
    setLoading(true);
    const res = await fetch(
      `/api/programs/match?medication_id=${selectedMed.id}&insurance_type=${insuranceType}`
    );
    if (res.ok) {
      setPrograms(await res.json());
    }
    setLoading(false);
    setStep(3);
  }

  function openElevenLabs() {
    // Dispatch custom event to trigger ElevenLabs widget
    window.dispatchEvent(new CustomEvent("open-elevenlabs"));
  }

  async function handleCallbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCallbackError("");
    try {
      const res = await fetch("/api/copay-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: callbackEmail,
          preferred_call_time: callbackTime || null,
          insurance_type: insuranceType || null,
          consent_to_contact: callbackConsent,
        }),
      });
      if (res.ok) {
        setCallbackSubmitted(true);
      } else {
        setCallbackError("Please check your email address.");
      }
    } catch {
      setCallbackError("Something went wrong. Please try again.");
    }
  }

  // Compute max likelihood from matched programs
  const maxLikelihood = programs.length > 0
    ? programs.reduce((best, p) => {
        const order: Record<string, number> = { "98-95%": 3, "90-95%": 2, "85-90%": 1 };
        return (order[p.likelihood_can_help] || 0) > (order[best] || 0) ? p.likelihood_can_help : best;
      }, programs[0].likelihood_can_help)
    : "90-95%";

  return (
    <section id="check-savings" className="py-16 px-4 bg-gray-50">
      <div className="max-w-lg mx-auto">
        {/* Step 1: Medication */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
              Check Your Savings Now
            </h2>
            <p className="text-gray-500 text-center text-sm mb-6">
              Free &middot; No commitment &middot; Results in seconds
            </p>

            {/* Progress */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="w-3 h-3 rounded-full bg-[#1a365d]" />
              <span className="w-12 h-0.5 bg-gray-200" />
              <span className="w-3 h-3 rounded-full bg-gray-200" />
            </div>

            <p className="font-semibold text-gray-900 mb-1">What medication are you on?</p>
            <p className="text-sm text-gray-500 mb-3">Select your current specialty medication</p>

            <div className="relative mb-6" ref={dropdownRef}>
              <input
                type="text"
                placeholder="Search your medication..."
                value={medQuery}
                onChange={(e) => handleMedInputChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
              />
              {showDropdown && medications.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {medications.map((med) => (
                    <button
                      key={med.id}
                      onClick={() => handleSelectMed(med)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                    >
                      <span className="text-gray-400">&#x211E;</span>
                      <span>
                        <span className="font-medium">{med.brand_names[0]}</span>
                        <span className="text-gray-500 text-sm ml-2">({med.generic_name})</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => selectedMed && setStep(2)}
              disabled={!selectedMed}
              className={`w-full py-4 rounded-lg text-lg font-semibold transition-colors ${
                selectedMed
                  ? "bg-[#1a365d] text-white hover:bg-[#2a4a7f]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next &rarr;
            </button>
          </div>
        )}

        {/* Step 2: Insurance */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
              Check Your Savings Now
            </h2>
            <p className="text-gray-500 text-center text-sm mb-6">
              Free &middot; No commitment &middot; Results in seconds
            </p>

            {/* Progress */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="w-12 h-0.5 bg-[#1a365d]" />
              <span className="w-3 h-3 rounded-full bg-[#1a365d]" />
            </div>

            <p className="font-semibold text-gray-900 mb-1">What type of insurance do you have?</p>
            <p className="text-sm text-gray-500 mb-4">This determines which programs you qualify for</p>

            <div className="space-y-2 mb-6">
              {INSURANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setInsuranceType(opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors flex items-start gap-3 ${
                    insuranceType === opt.value
                      ? "border-[#1a365d] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-xl mt-0.5">{opt.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSeeResults}
                disabled={!insuranceType || loading}
                className={`flex-1 py-4 rounded-lg text-lg font-semibold transition-colors ${
                  insuranceType
                    ? "bg-[#1a365d] text-white hover:bg-[#2a4a7f]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Searching..." : "See My Results \u2192"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-4">
              <button
                onClick={() => { setStep(2); setPrograms([]); }}
                className="text-[#1a365d] text-sm mb-4 inline-block hover:underline"
              >
                &larr; Change insurance type
              </button>

              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Your Results for {selectedMed?.brand_names[0]}
              </h2>

              {programs.length > 0 ? (
                <>
                  {/* Likelihood badge */}
                  <div className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1.5 rounded-full mb-4">
                    Likelihood we can help: {maxLikelihood}
                  </div>

                  {/* Info box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-900">
                      Based on available programs for your medication, patients with{" "}
                      <strong>{insuranceLabel[insuranceType]}</strong> insurance typically save
                      $2,000&ndash;$10,000 per year, often reducing monthly out-of-pocket costs
                      to as little as $0&ndash;$5. Your exact savings depend on your specific
                      plan details, which we will review with you.
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                  <p className="text-gray-700">
                    We&apos;re researching assistance options for your medication and insurance type.
                    Talk to a specialist who can help identify additional options.
                  </p>
                </div>
              )}

              {/* Expandable FAQ */}
              <button
                onClick={() => setFaqOpen(!faqOpen)}
                className="w-full text-left flex items-center justify-between py-3 border-t border-gray-100"
              >
                <span className="font-medium text-gray-700 text-sm">
                  Why don&apos;t I already know about this?
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${faqOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {faqOpen && (
                <div className="pb-4 text-sm text-gray-600">
                  <p>
                    Most patients miss these programs because they&apos;re managed by different
                    organizations &mdash; drug manufacturers, private foundations, and government
                    agencies &mdash; each with their own applications, eligibility rules, and
                    renewal processes. Doctors&apos; offices rarely have time to track them all.
                    A medication access specialist cuts through the complexity so you don&apos;t have to.
                  </p>
                </div>
              )}

              {/* Locked savings plan teaser */}
              <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-gray-700 text-sm">Your Personalized Savings Plan</span>
                </div>
                <p className="text-xs text-gray-500">
                  Unlock by connecting with a VITAL specialist below
                </p>
              </div>
            </div>

            {/* CTA section — Talk to Sarah (primary) + Callback (secondary) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Ready to Save?
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Our specialist Sarah can review your options right now
              </p>

              {/* Primary CTA — opens ElevenLabs */}
              <button
                onClick={openElevenLabs}
                className="w-full py-4 bg-[#1a365d] text-white rounded-lg text-lg font-semibold hover:bg-[#2a4a7f] transition-colors flex items-center justify-center gap-3 shadow-lg mb-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Talk to a Specialist Now
              </button>

              {/* Secondary — Callback fallback */}
              {!showCallbackForm && !callbackSubmitted && (
                <button
                  onClick={() => setShowCallbackForm(true)}
                  className="text-sm text-gray-500 hover:text-[#1a365d] transition-colors underline"
                >
                  Prefer a callback? Leave your info here
                </button>
              )}

              {showCallbackForm && !callbackSubmitted && (
                <form onSubmit={handleCallbackSubmit} className="mt-4 text-left space-y-3">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={callbackEmail}
                    onChange={(e) => setCallbackEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] text-sm"
                  />

                  <select
                    value={callbackTime}
                    onChange={(e) => setCallbackTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] bg-white text-sm"
                  >
                    <option value="">Select best time to call...</option>
                    <option value="morning">Morning (9am&ndash;12pm)</option>
                    <option value="afternoon">Afternoon (12pm&ndash;5pm)</option>
                    <option value="evening">Evening (5pm&ndash;8pm)</option>
                    <option value="anytime">Anytime</option>
                  </select>

                  <label className="flex items-start gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={callbackConsent}
                      onChange={(e) => setCallbackConsent(e.target.checked)}
                      required
                      className="mt-0.5"
                    />
                    I agree to be contacted by a VITAL medication access specialist.
                  </label>

                  {callbackError && (
                    <p className="text-red-600 text-sm">{callbackError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Request Callback
                  </button>
                </form>
              )}

              {callbackSubmitted && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    Thank you! A VITAL specialist will contact you within 48 hours.
                  </p>
                </div>
              )}
            </div>

            {/* Start over */}
            <div className="text-center mt-4">
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedMed(null);
                  setMedQuery("");
                  setInsuranceType("");
                  setPrograms([]);
                  setFaqOpen(false);
                  setShowCallbackForm(false);
                  setCallbackSubmitted(false);
                  setCallbackEmail("");
                  setCallbackTime("");
                  setCallbackConsent(false);
                }}
                className="text-sm text-[#1a365d] hover:underline"
              >
                Check another medication
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
