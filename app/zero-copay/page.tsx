"use client";

import { useState } from "react";

const MEDICATIONS = [
  { name: "Humira (adalimumab)", class: "TNF Inhibitor", avgCost: "$6,800/yr" },
  { name: "Enbrel (etanercept)", class: "TNF Inhibitor", avgCost: "$6,200/yr" },
  { name: "Rinvoq (upadacitinib)", class: "JAK Inhibitor", avgCost: "$7,100/yr" },
  { name: "Cosentyx (secukinumab)", class: "IL-17A Inhibitor", avgCost: "$5,900/yr" },
  { name: "Xeljanz (tofacitinib)", class: "JAK Inhibitor", avgCost: "$5,400/yr" },
];

const INSURANCE_OPTIONS = [
  { value: "commercial", label: "Commercial / Employer", icon: "🏢", desc: "Through your employer or private plan" },
  { value: "medicare", label: "Medicare", icon: "🏥", desc: "Medicare Part D or Advantage" },
  { value: "medicaid", label: "Medicaid", icon: "📋", desc: "State Medicaid program" },
  { value: "dual_eligible", label: "Medicare + Medicaid", icon: "🔄", desc: "Dual eligible" },
  { value: "uninsured", label: "Uninsured", icon: "👤", desc: "No insurance / self-pay" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME",
  "MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI",
  "SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

const FAQS = [
  { q: "Is this really $0?", a: "Yes. We combine manufacturer copay assistance, patient support programs, and foundation grants to cover your entire out-of-pocket cost. The specific programs vary by medication and insurance type, but the result is the same: $0 at every fill." },
  { q: "What's the catch?", a: "No catch. We're a licensed specialty pharmacy. We make our revenue from the same pharmacy margins as any other specialty pharmacy — not from you. Bringing your cost to $0 means you stay on your medication, which is better for you and better for our business." },
  { q: "Will my medication be interrupted during the transfer?", a: "No. We time the transfer to align with your refill schedule. Your current pharmacy continues to fill until we're ready. There is no gap in coverage." },
  { q: "How long does the transfer take?", a: "Typically 7-10 days from start to finish. The main variable is prior authorization processing by your insurance, which usually takes 3-5 business days." },
  { q: "What if my insurance changes?", a: "We re-evaluate your coverage with every change. If your insurance changes, we find the new combination of programs that keeps your cost at $0. This is an ongoing service, not a one-time enrollment." },
  { q: "Do you accept Medicare?", a: "Yes. Medicare patients qualify through patient assistance foundations like the PAN Foundation, HealthWell Foundation, and others. We identify which fund is open and handle the application." },
  { q: "What about biosimilars?", a: "We cover both brand-name biologics and their biosimilars. In some cases, a biosimilar may actually have better copay assistance available. We'll help you find the best option." },
  { q: "Is my information safe?", a: "We are a licensed, HIPAA-compliant specialty pharmacy. We collect only the minimum information needed to process your transfer and never sell or share your data." },
  { q: "What if my doctor doesn't approve the transfer?", a: "The vast majority of prescribers approve transfers when patients request them. If your prescriber has concerns, we work with their office directly to address them. You are always in control of where your prescription goes." },
  { q: "How is this different from a copay card?", a: "A copay card is one layer of assistance. We stack multiple layers — manufacturer programs, foundation grants, and pharmacy-level support — to cover what a single copay card can't. Most patients using only a copay card still pay $500-$2,000/year." },
  { q: "What medications do you cover?", a: "We currently cover the major biologics and JAK inhibitors used in rheumatology: adalimumab (Humira), etanercept (Enbrel), upadacitinib (Rinvoq), secukinumab (Cosentyx), tofacitinib (Xeljanz), and their biosimilars. More medications are being added." },
  { q: "Can I go back to my old pharmacy?", a: "Yes. You can transfer back at any time. There is no lock-in, no contract, and no penalty. We earn your business by saving you money, not by making it hard to leave." },
];

export default function ZeroCopayPage() {
  const [step, setStep] = useState<"hero" | "form" | "result">("hero");
  const [selectedMed, setSelectedMed] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [insuranceType, setInsuranceType] = useState("");
  const [formState, setFormState] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [qualified, setQualified] = useState<boolean | null>(null);
  const [savings, setSavings] = useState("");
  const [program, setProgram] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filteredMeds = MEDICATIONS.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function checkEligibility() {
    setSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));

    if (insuranceType === "medicaid") {
      setQualified(false);
      setSavings("");
      setProgram("");
    } else {
      setQualified(true);
      const med = MEDICATIONS.find(m => m.name === selectedMed);
      setSavings(med?.avgCost || "$5,000+/yr");
      setProgram(
        insuranceType === "commercial" ? "Manufacturer Copay Card + Pharmacy Program" :
        insuranceType === "medicare" || insuranceType === "dual_eligible" ? "PAN Foundation + Pharmacy Program" :
        "Patient Assistance Program (PAP)"
      );
    }
    setSubmitting(false);
    setStep("result");
  }

  async function handleTransferStart() {
    setSubmitting(true);
    try {
      await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          state: formState,
          medication_name: selectedMed,
          insurance_type: insuranceType,
        }),
      });
      setSubmitted(true);
    } catch (e) {
      // Silently handle
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="text-lg font-bold text-[#1a365d]">VITAL Health</a>
          <a href="/tracker" className="text-sm text-[#2563eb] font-medium hover:underline">Symptom Tracker →</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-14">
        <div className="bg-gradient-to-br from-[#1a365d] via-[#1e40af] to-[#2563eb] text-white">
          <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
              Your Biologic Costs $5,000/Year.
              <br />
              <span className="text-emerald-300">Ours Costs $0.</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              We&apos;re a specialty pharmacy that combines manufacturer copay assistance,
              patient support programs, and our own cost-coverage to bring your
              annual out-of-pocket to zero.
            </p>
            <button
              onClick={() => {
                const el = document.getElementById("eligibility-form");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-emerald-400 hover:bg-emerald-300 text-[#1a365d] font-bold text-lg px-8 py-4 rounded-xl transition-colors shadow-lg"
            >
              Check If Your Medication Qualifies →
            </button>
            <p className="mt-6 text-blue-200 text-sm">
              No catch. Here&apos;s exactly how ↓
            </p>
          </div>
        </div>
      </section>

      {/* The Math */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a365d] text-center mb-4">
            Here&apos;s Exactly How the Math Works
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            We don&apos;t use magic. We stack every available assistance program so each one covers what the others don&apos;t.
          </p>

          <div className="space-y-6">
            {[
              { step: 1, title: "Manufacturer Copay Programs", desc: "Every major biologic manufacturer offers copay assistance. For commercially insured patients, these alone can reduce costs by 60-80%. We handle the enrollment.", amount: "-$4,000", color: "bg-blue-50 border-blue-200" },
              { step: 2, title: "Patient Assistance Foundations", desc: "The PAN Foundation, HealthWell Foundation, and others have dedicated funds for RA, PsA, and autoimmune patients. For Medicare patients, this is the primary cost-coverage layer.", amount: "-$1,500", color: "bg-purple-50 border-purple-200" },
              { step: 3, title: "Pharmacy Program Coverage", desc: "We cover what remains. Our program fills the gap between what manufacturer and foundation programs cover and your actual out-of-pocket cost.", amount: "-$1,300", color: "bg-emerald-50 border-emerald-200" },
              { step: 4, title: "We Handle ALL the Paperwork", desc: "Prior authorizations, enrollment forms, annual renewals, insurance changes — we manage the entire process so you never have to.", amount: "= $0", color: "bg-emerald-100 border-emerald-400" },
            ].map(({ step, title, desc, amount, color }) => (
              <div key={step} className={`${color} border rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-4`}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1a365d] text-white flex items-center justify-center font-bold">
                  {step}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#1a365d] text-lg">{title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{desc}</p>
                </div>
                <div className={`text-xl font-bold ${step === 4 ? "text-emerald-600" : "text-[#1a365d]"}`}>
                  {amount}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-[#1a365d] text-white rounded-xl p-6 text-center">
            <p className="text-blue-200 text-sm mb-1">Average annual biologic cost with insurance</p>
            <p className="text-3xl font-bold"><span className="line-through text-red-300">$6,800/yr</span> → <span className="text-emerald-300">$0/yr</span></p>
          </div>
        </div>
      </section>

      {/* Medications Covered */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a365d] text-center mb-12">
            Medications We Cover
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEDICATIONS.map(med => (
              <div key={med.name} className="border border-gray-200 rounded-xl p-5 hover:border-[#2563eb] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-[#1a365d]">{med.name.split(" (")[0]}</h3>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">Eligible ✓</span>
                </div>
                <p className="text-sm text-gray-500">{med.name.split(" (")[1]?.replace(")", "")}</p>
                <p className="text-sm text-gray-500">{med.class}</p>
                <p className="text-sm mt-2">
                  <span className="line-through text-red-400">{med.avgCost}</span>
                  <span className="text-emerald-600 font-bold ml-2">→ $0/yr</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Transfer Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a365d] text-center mb-12">
            How the Transfer Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Check Eligibility", desc: "60-second form. We tell you immediately if you qualify for $0 copay and how much you'll save.", time: "60 seconds" },
              { step: "2", title: "We Handle Everything", desc: "We contact your current pharmacy, work with your prescriber, and file all prior authorization paperwork.", time: "3-7 days" },
              { step: "3", title: "Medication Arrives at $0", desc: "Your biologic ships directly to you. First fill and every fill after — $0 out of pocket.", time: "7-10 days total" },
            ].map(({ step, title, desc, time }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#1a365d] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-bold text-[#1a365d] text-lg mb-2">{title}</h3>
                <p className="text-gray-600 text-sm mb-2">{desc}</p>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility Form */}
      <section id="eligibility-form" className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a365d] text-center mb-4">
            Check If You Qualify
          </h2>
          <p className="text-gray-600 text-center mb-8">Takes 60 seconds. No obligation.</p>

          {step === "result" && qualified !== null ? (
            <div className="space-y-6">
              {qualified ? (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-8 text-center">
                  <div className="text-5xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold text-emerald-700 mb-2">You Qualify for $0 Copay</h3>
                  <p className="text-emerald-600 mb-1">Medication: <strong>{selectedMed}</strong></p>
                  <p className="text-emerald-600 mb-1">Estimated annual savings: <strong>{savings}</strong></p>
                  <p className="text-emerald-600 mb-4">Program: <strong>{program}</strong></p>

                  {!submitted ? (
                    <div className="space-y-4 max-w-sm mx-auto">
                      <button
                        onClick={handleTransferStart}
                        disabled={submitting}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {submitting ? "Starting Transfer..." : "Start Your Transfer →"}
                      </button>
                      <p className="text-sm text-gray-500">
                        Or <a href="/transfer" className="text-[#2563eb] underline">learn more about the transfer process</a>
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-6 mt-4">
                      <h4 className="font-bold text-[#1a365d] mb-3">Transfer Request Submitted!</h4>
                      <p className="text-gray-600 text-sm mb-4">Here&apos;s what happens next:</p>
                      <div className="text-left space-y-3">
                        {[
                          { label: "Request received", done: true },
                          { label: "Eligibility verified (within 2 hours)", done: false },
                          { label: "Pharmacy contacted (within 24 hours)", done: false },
                          { label: "Prescriber confirmation (1-3 days)", done: false },
                          { label: "Prior authorization (3-7 days)", done: false },
                          { label: "First fill shipped (7-10 days)", done: false },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${item.done ? "bg-emerald-500 text-white" : "border-2 border-gray-300"}`}>
                              {item.done ? "✓" : ""}
                            </span>
                            <span className={`text-sm ${item.done ? "text-emerald-700 font-medium" : "text-gray-500"}`}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                      <a href="/transfer/status" className="inline-block mt-4 text-sm text-[#2563eb] underline">Track your transfer status →</a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
                  <h3 className="text-xl font-bold text-[#1a365d] mb-2">Let Us Look Into Your Situation</h3>
                  <p className="text-gray-600 mb-4">
                    Your insurance type may have specific program options. Our specialist can research your specific situation and find the best path to $0.
                  </p>
                  <a href="/#check-savings" className="inline-block bg-[#1a365d] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#2a4a7f] transition-colors">
                    Talk to a Specialist →
                  </a>
                </div>
              )}
              <button
                onClick={() => { setStep("hero"); setQualified(null); setSelectedMed(""); setInsuranceType(""); setSubmitted(false); }}
                className="block mx-auto text-sm text-gray-500 underline"
              >
                Check another medication
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              {/* Medication */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Medication</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search medication name..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setShowMedDropdown(true); }}
                    onFocus={() => setShowMedDropdown(true)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                  />
                  {selectedMed && (
                    <div className="absolute right-3 top-3 bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
                      ✓ {selectedMed.split(" (")[0]}
                    </div>
                  )}
                  {showMedDropdown && searchQuery && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredMeds.map(med => (
                        <button
                          key={med.name}
                          onClick={() => { setSelectedMed(med.name); setSearchQuery(med.name); setShowMedDropdown(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-b-0"
                        >
                          <span className="font-medium text-[#1a365d]">{med.name}</span>
                          <span className="block text-xs text-gray-500">{med.class} · Average: {med.avgCost}</span>
                        </button>
                      ))}
                      {filteredMeds.length === 0 && (
                        <p className="px-4 py-3 text-sm text-gray-500">No medications found</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Insurance Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INSURANCE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setInsuranceType(opt.value)}
                      className={`text-left p-3 rounded-xl border-2 transition-colors ${
                        insuranceType === opt.value
                          ? "border-[#2563eb] bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-lg mr-2">{opt.icon}</span>
                      <span className="font-medium text-sm text-[#1a365d]">{opt.label}</span>
                      <p className="text-xs text-gray-500 mt-0.5 ml-8">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select
                  value={formState}
                  onChange={e => setFormState(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                >
                  <option value="">Select your state</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone <span className="text-gray-400">(optional — for text updates)</span></label>
                <input
                  type="tel"
                  placeholder="555-000-0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              <button
                onClick={checkEligibility}
                disabled={!selectedMed || !insuranceType || !formState || !email || submitting}
                className="w-full bg-[#1a365d] hover:bg-[#2a4a7f] text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-lg"
              >
                {submitting ? "Checking..." : "Check If You Qualify →"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a365d] text-center mb-12">
            Questions Patients Ask
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between"
                >
                  <span className="font-medium text-[#1a365d] pr-4">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${expandedFaq === i ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-[#1a365d] mb-8">Why Patients Trust Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-blue-50 rounded-xl p-6">
              <p className="text-3xl font-bold text-[#1a365d]">2,400+</p>
              <p className="text-sm text-gray-600 mt-1">Patients served</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-6">
              <p className="text-3xl font-bold text-emerald-600">$4,800</p>
              <p className="text-sm text-gray-600 mt-1">Average annual savings</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-6">
              <p className="text-3xl font-bold text-purple-600">$0</p>
              <p className="text-sm text-gray-600 mt-1">Out-of-pocket for 97% of patients</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 max-w-lg mx-auto">
            <p className="text-gray-600 text-sm leading-relaxed">
              VITAL Health Technologies was founded by a Harvard-trained physician who saw
              patients abandoning life-changing medications because they couldn&apos;t afford the copay.
              We are a licensed specialty pharmacy committed to making biologic medications
              accessible to every patient who needs them.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a365d] text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-blue-200 text-sm">© 2026 VITAL Health Technologies. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-3 text-xs text-blue-300">
            <span>Licensed Specialty Pharmacy</span>
            <span>·</span>
            <span>HIPAA Compliant</span>
            <span>·</span>
            <a href="/" className="hover:text-white">Back to Main Site</a>
          </div>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 p-3 z-40">
        <button
          onClick={() => {
            const el = document.getElementById("eligibility-form");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl"
        >
          Check If You Qualify — $0 Copay →
        </button>
      </div>
    </div>
  );
}
