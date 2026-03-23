"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { US_STATES } from "@/lib/transfer-mock-data";

/* ─── types ─── */
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
  { value: "commercial", label: "Commercial / Employer", desc: "Insurance through your job or purchased privately" },
  { value: "medicare", label: "Medicare", desc: "Federal program, typically 65+" },
  { value: "medicaid", label: "Medicaid", desc: "State-based program" },
  { value: "dual_eligible", label: "Dual Eligible", desc: "Both Medicare and Medicaid" },
  { value: "uninsured", label: "Uninsured / Self-Pay", desc: "No insurance coverage" },
];

/* ─── helpers ─── */
function formatPhone(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/* ─── component ─── */
export default function TransferPage() {
  const [step, setStep] = useState(1);

  /* Step 1 */
  const [medQuery, setMedQuery] = useState("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [insuranceType, setInsuranceType] = useState("");
  const [state, setState] = useState("");
  const [email, setEmail] = useState("");
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Step 2 */
  const [pharmacyName, setPharmacyName] = useState("");
  const [pharmacyPhone, setPharmacyPhone] = useState("");
  const [prescriberName, setPrescriberName] = useState("");
  const [prescriberPhone, setPrescriberPhone] = useState("");
  const [currentDose, setCurrentDose] = useState("");
  const [dob, setDob] = useState("");
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [memberId, setMemberId] = useState("");
  const [phone, setPhone] = useState("");

  /* Step 3 */
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* ─── medication search ─── */
  useEffect(() => {
    if (medQuery.length < 2 || selectedMed) {
      setMedications([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/medications/search?query=${encodeURIComponent(medQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setMedications(data);
          setShowDropdown(true);
        }
      } catch { /* ignore */ }
    }, 200);
    return () => clearTimeout(timer);
  }, [medQuery, selectedMed]);

  /* click outside */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSelectMed(med: Medication) {
    setSelectedMed(med);
    setMedQuery(`${med.brand_names[0]} (${med.generic_name})`);
    setShowDropdown(false);
    setMedications([]);
  }

  /* ─── eligibility check ─── */
  async function checkEligibility() {
    if (!selectedMed || !insuranceType || !state || !email) return;
    setEligibilityLoading(true);
    try {
      const res = await fetch(
        `/api/programs/match?medication_id=${selectedMed.id}&insurance_type=${insuranceType}`
      );
      if (res.ok) {
        setPrograms(await res.json());
      }
    } catch { /* ignore */ }
    setEligibilityLoading(false);
    setEligibilityChecked(true);
    setShowCheckmark(true);
  }

  /* ─── submit transfer ─── */
  async function handleSubmit() {
    setSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
  }

  /* ─── computed ─── */
  const maxSavings = programs.length > 0
    ? programs.reduce((best, p) => {
        const val = parseInt(p.estimated_annual_savings.replace(/\D/g, ""), 10) || 0;
        const bestVal = parseInt(best.replace(/\D/g, ""), 10) || 0;
        return val > bestVal ? p.estimated_annual_savings : best;
      }, programs[0].estimated_annual_savings)
    : "$0";

  const step1Valid = !!selectedMed && !!insuranceType && !!state && !!email;
  const step2Valid =
    !!pharmacyName && !!pharmacyPhone && !!prescriberName && !!prescriberPhone &&
    !!currentDose && !!dob && !!insuranceProvider && !!memberId && !!phone;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1a365d] to-[#2a4a7f] text-white py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">
            VITAL Health
          </Link>
          <span className="text-blue-200 text-sm hidden sm:inline">Prescription Transfer</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress bar */}
        {!submitted && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    step > s
                      ? "bg-green-500 text-white"
                      : step === s
                      ? "bg-[#1a365d] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > s ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                {s < 3 && (
                  <div className={`w-12 sm:w-20 h-0.5 ${step > s ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════ STEP 1 ══════════════════════════════════════ */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Check Your Eligibility</h1>
            <p className="text-gray-500 text-sm mb-6">
              See if you qualify for $0 copay on your specialty medication
            </p>

            {/* Medication search */}
            <label className="block font-medium text-gray-900 mb-1 text-sm">Medication</label>
            <p className="text-xs text-gray-500 mb-2">Search by brand or generic name</p>
            <div className="relative mb-5" ref={dropdownRef}>
              <input
                type="text"
                placeholder="Search your medication..."
                value={medQuery}
                onChange={(e) => { setMedQuery(e.target.value); setSelectedMed(null); setEligibilityChecked(false); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent text-sm"
              />
              {showDropdown && medications.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {medications.map((med) => (
                    <button
                      key={med.id}
                      onClick={() => handleSelectMed(med)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="font-medium">{med.brand_names[0]}</span>
                      <span className="text-gray-500 text-sm ml-2">({med.generic_name})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Insurance type */}
            <label className="block font-medium text-gray-900 mb-1 text-sm">Insurance Type</label>
            <p className="text-xs text-gray-500 mb-2">Select your current coverage</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
              {INSURANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setInsuranceType(opt.value); setEligibilityChecked(false); }}
                  className={`text-left px-3 py-2.5 rounded-lg border-2 transition-colors ${
                    insuranceType === opt.value
                      ? "border-[#1a365d] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-medium text-gray-900 text-sm">{opt.label}</p>
                  <p className="text-xs text-gray-500">{opt.desc}</p>
                </button>
              ))}
            </div>

            {/* State */}
            <label className="block font-medium text-gray-900 mb-1 text-sm">State</label>
            <select
              value={state}
              onChange={(e) => { setState(e.target.value); setEligibilityChecked(false); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] bg-white text-sm mb-5"
            >
              <option value="">Select your state...</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>

            {/* Email */}
            <label className="block font-medium text-gray-900 mb-1 text-sm">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] text-sm mb-6"
            />

            {/* Check Eligibility button */}
            {!eligibilityChecked && (
              <button
                onClick={checkEligibility}
                disabled={!step1Valid || eligibilityLoading}
                className={`w-full py-4 rounded-lg text-lg font-semibold transition-colors ${
                  step1Valid
                    ? "bg-[#1a365d] text-white hover:bg-[#2a4a7f]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {eligibilityLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Checking eligibility...
                  </span>
                ) : (
                  "Check Eligibility \u2192"
                )}
              </button>
            )}

            {/* Eligibility result */}
            {eligibilityChecked && (
              <div className="mt-2">
                {programs.length > 0 ? (
                  <div className={`border-2 border-green-300 bg-green-50 rounded-xl p-6 text-center transition-all duration-500 ${showCheckmark ? "animate-fade-in" : ""}`}>
                    {/* Checkmark animation */}
                    <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 animate-scale-in">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-green-900 mb-2">$0 Copay Confirmed!</h3>
                    <p className="text-green-800 text-sm mb-4">
                      Based on your medication and insurance, you qualify for assistance programs.
                    </p>

                    {/* Savings breakdown */}
                    <div className="bg-white rounded-lg p-4 text-left space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Estimated annual savings</span>
                        <span className="font-bold text-green-700 text-lg">{maxSavings}</span>
                      </div>
                      <div className="border-t border-gray-100 pt-2">
                        <p className="text-xs text-gray-500 font-medium mb-2">Eligible programs:</p>
                        {programs.map((p) => (
                          <div key={p.id} className="flex justify-between items-center py-1">
                            <span className="text-sm text-gray-800">{p.program_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              p.fund_status === "open"
                                ? "bg-green-100 text-green-700"
                                : p.fund_status === "waitlist"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {p.fund_status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setStep(2)}
                      className="w-full py-4 bg-[#1a365d] text-white rounded-lg text-lg font-semibold hover:bg-[#2a4a7f] transition-colors"
                    >
                      Start My Transfer \u2192
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-yellow-300 bg-yellow-50 rounded-xl p-6 text-center">
                    <p className="text-gray-700 mb-4">
                      We&apos;re researching assistance options for your medication and insurance combination.
                      A specialist can help identify additional options.
                    </p>
                    <button
                      onClick={() => setStep(2)}
                      className="w-full py-4 bg-[#1a365d] text-white rounded-lg text-lg font-semibold hover:bg-[#2a4a7f] transition-colors"
                    >
                      Continue Anyway \u2192
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════ STEP 2 ══════════════════════════════════════ */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Transfer Details</h1>
            <p className="text-gray-500 text-sm mb-6">
              Provide your current pharmacy and prescriber information so we can handle the transfer.
            </p>

            {/* Current Pharmacy */}
            <div className="border-b border-gray-100 pb-5 mb-5">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-[#1a365d] rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Current Pharmacy
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacy Name</label>
                  <input
                    type="text"
                    placeholder="e.g., CVS Specialty, Walgreens"
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacy Phone</label>
                  <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={pharmacyPhone}
                    onChange={(e) => setPharmacyPhone(formatPhone(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Prescriber */}
            <div className="border-b border-gray-100 pb-5 mb-5">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-[#1a365d] rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Prescriber
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prescriber Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. Rebecca Chen"
                    value={prescriberName}
                    onChange={(e) => setPrescriberName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prescriber Phone</label>
                  <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={prescriberPhone}
                    onChange={(e) => setPrescriberPhone(formatPhone(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Medication & Insurance */}
            <div className="border-b border-gray-100 pb-5 mb-5">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-[#1a365d] rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Medication &amp; Insurance
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Dose</label>
                  <input
                    type="text"
                    placeholder="e.g., 40mg every 2 weeks"
                    value={currentDose}
                    onChange={(e) => setCurrentDose(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                  <input
                    type="text"
                    placeholder="e.g., Blue Cross Blue Shield"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member ID</label>
                  <input
                    type="text"
                    placeholder="e.g., BCB882991045"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-[#1a365d] rounded-full flex items-center justify-center text-xs font-bold">4</span>
                Contact for Updates
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">We&apos;ll send text updates about your transfer status</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 text-sm"
              >
                Back
              </button>
              <button
                onClick={() => step2Valid && setStep(3)}
                disabled={!step2Valid}
                className={`flex-1 py-4 rounded-lg text-lg font-semibold transition-colors ${
                  step2Valid
                    ? "bg-[#1a365d] text-white hover:bg-[#2a4a7f]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Review &amp; Confirm \u2192
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ STEP 3 ══════════════════════════════════════ */}
        {step === 3 && !submitted && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Confirm Your Transfer</h1>
            <p className="text-gray-500 text-sm mb-6">Please review your information before submitting.</p>

            {/* Summary card */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Medication</p>
                <p className="text-gray-900 font-medium">{medQuery}</p>
                <p className="text-gray-600">{currentDose}</p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Insurance</p>
                <p className="text-gray-900">{insuranceProvider} ({INSURANCE_OPTIONS.find(o => o.value === insuranceType)?.label})</p>
                <p className="text-gray-600">Member ID: {memberId}</p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Current Pharmacy</p>
                <p className="text-gray-900">{pharmacyName}</p>
                <p className="text-gray-600">{pharmacyPhone}</p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Prescriber</p>
                <p className="text-gray-900">{prescriberName}</p>
                <p className="text-gray-600">{prescriberPhone}</p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Contact</p>
                <p className="text-gray-900">{email}</p>
                <p className="text-gray-600">{phone}</p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Location</p>
                <p className="text-gray-900">{US_STATES.find(s => s.code === state)?.name || state}</p>
              </div>
              {programs.length > 0 && (
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Estimated Savings</p>
                  <p className="text-green-700 font-bold text-lg">{maxSavings}/year</p>
                </div>
              )}
            </div>

            {/* Consent */}
            <label className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4"
              />
              <span className="text-sm text-gray-700">
                I authorize VITAL Health Technologies to contact my pharmacy and prescriber to transfer my prescription.
                I understand this does not constitute a medical decision and I can cancel at any time.
              </span>
            </label>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-4 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 text-sm"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!consent || submitting}
                className={`flex-1 py-4 rounded-lg text-lg font-semibold transition-colors ${
                  consent
                    ? "bg-[#1a365d] text-white hover:bg-[#2a4a7f]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Transfer Request \u2192"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ SUCCESS ══════════════════════════════════════ */}
        {submitted && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 text-center">
            {/* Confetti-style checkmarks */}
            <div className="relative mb-6">
              <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {/* Decorative checkmarks */}
              <div className="absolute top-0 left-1/4 w-6 h-6 text-green-300 animate-bounce" style={{ animationDelay: "0.2s" }}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="absolute top-2 right-1/4 w-5 h-5 text-green-200 animate-bounce" style={{ animationDelay: "0.4s" }}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-1/3 w-4 h-4 text-green-400 animate-bounce" style={{ animationDelay: "0.6s" }}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Initiated!</h2>
            <p className="text-gray-600 mb-6">Here&apos;s what happens next:</p>

            {/* Timeline */}
            <div className="text-left space-y-0 mb-8">
              {[
                { icon: "check", label: "Request received", detail: "Now", done: true },
                { icon: "circle", label: "Eligibility verified", detail: "Within 2 hours", done: false },
                { icon: "circle", label: "Pharmacy contacted", detail: "Within 24 hours", done: false },
                { icon: "circle", label: "Prescriber confirmation", detail: "1-3 days", done: false },
                { icon: "circle", label: "Prior authorization", detail: "3-7 days", done: false },
                { icon: "circle", label: "First fill shipped", detail: "7-10 days", done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  {/* Connector line */}
                  {i < 5 && (
                    <div className="absolute left-[11px] top-6 w-0.5 h-full bg-gray-200" />
                  )}
                  {/* Icon */}
                  <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.done ? "bg-green-500" : "border-2 border-gray-300 bg-white"
                  }`}>
                    {item.done && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {/* Text */}
                  <div className="pb-6">
                    <p className={`font-medium text-sm ${item.done ? "text-green-700" : "text-gray-700"}`}>{item.label}</p>
                    <p className="text-xs text-gray-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
              <p className="text-sm text-blue-900">
                You&apos;ll receive text updates at <strong>{phone}</strong> as each step is completed.
              </p>
            </div>

            {/* Track status link */}
            <Link
              href="/transfer/status"
              className="block w-full py-4 bg-[#1a365d] text-white rounded-lg text-lg font-semibold hover:bg-[#2a4a7f] transition-colors text-center mb-3"
            >
              Track Your Transfer Status \u2192
            </Link>

            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-[#1a365d] transition-colors"
            >
              Return to home
            </Link>
          </div>
        )}

        {/* Trust badges */}
        {!submitted && (
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                256-bit encryption
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                HIPAA compliant
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                Text updates
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
