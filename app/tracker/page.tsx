'use client';

import { useState } from 'react';
import Link from 'next/link';

const CONDITIONS = [
  { value: 'rheumatoid_arthritis', label: 'Rheumatoid Arthritis' },
  { value: 'psoriatic_arthritis', label: 'Psoriatic Arthritis' },
  { value: 'ankylosing_spondylitis', label: 'Ankylosing Spondylitis' },
  { value: 'lupus', label: 'Lupus (SLE)' },
  { value: 'crohns', label: "Crohn's Disease" },
  { value: 'ulcerative_colitis', label: 'Ulcerative Colitis' },
  { value: 'psoriasis', label: 'Psoriasis' },
  { value: 'multiple_sclerosis', label: 'Multiple Sclerosis' },
  { value: 'other', label: 'Other' },
];

const INSURANCE_TYPES = [
  { value: 'commercial', label: 'Commercial / Employer' },
  { value: 'medicare', label: 'Medicare' },
  { value: 'medicaid', label: 'Medicaid' },
  { value: 'dual_eligible', label: 'Dual Eligible (Medicare + Medicaid)' },
  { value: 'uninsured', label: 'Uninsured' },
];

const FEATURES = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    title: 'Daily Symptom Logging with Body Joint Map',
    description: 'Tap affected joints on an interactive body map. Track pain, stiffness, fatigue, sleep, and stress in under 2 minutes.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
    title: 'Claude AI Weekly Analysis & Flare Detection',
    description: 'Get personalized weekly insights powered by AI. Spot emerging flares before they peak with pattern recognition.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    title: 'Provider Visit Prep Documents',
    description: 'Walk into every appointment with a 90-day symptom summary, flare analysis, and recommended questions to ask.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: 'Lab Value Tracking with Plain-Language Explanations',
    description: 'Enter your lab results and get clear, simple explanations of what each value means for your condition.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: 'Medication Adherence Monitoring',
    description: 'Track every dose. See how adherence correlates with your symptom scores. Never wonder if you took your medication.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: '360-Degree Health Timeline View',
    description: 'See your complete health story in one scrollable timeline. Symptoms, labs, visits, and medication changes all in context.',
  },
];

export default function TrackerLandingPage() {
  const [email, setEmail] = useState('');
  const [condition, setCondition] = useState('');
  const [insuranceType, setInsuranceType] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !condition) return;
    setSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f1b44] via-[#162458] to-[#1e3a6e] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          <Link
            href="/"
            className="inline-block mb-6 text-sm text-blue-200 hover:text-white transition-colors"
          >
            &larr; Back to VITAL Health Technologies
          </Link>
          <div className="inline-block px-3 py-1 mb-6 text-xs font-semibold uppercase tracking-wider bg-blue-500/30 rounded-full border border-blue-400/30">
            Early Access
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-6">
            Finally, a symptom tracker that actually understands your disease
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Track symptoms, analyze flare patterns, and walk into every appointment with 90 days of your actual data — analyzed by AI.
          </p>
          <a
            href="#signup"
            className="inline-block px-8 py-4 bg-white text-[#0f1b44] font-semibold rounded-lg hover:bg-blue-50 transition-colors text-lg shadow-lg"
          >
            Get Early Access
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">
          Built for patients with complex conditions
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          Everything you need to take control of your health data, understand your patterns, and advocate for yourself.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-gray-100 bg-white hover:shadow-lg hover:border-blue-100 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#1e3a6e] flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Signup Form */}
      <section id="signup" className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-lg mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
            Join the Early Access List
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Be among the first to try VITAL Symptom Tracker when it launches.
          </p>

          {submitted ? (
            <div className="bg-white rounded-xl shadow-sm border border-green-100 p-8 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">You&apos;re on the list!</h3>
              <p className="text-gray-500 mb-6">
                We&apos;ll email you when VITAL Symptom Tracker is ready for early access.
              </p>
              <Link
                href="/tracker/dashboard"
                className="inline-block px-6 py-3 bg-[#0f1b44] text-white rounded-lg font-medium hover:bg-[#1e3a6e] transition-colors"
              >
                Preview the Dashboard
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address <span className="text-red-400">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                  Primary condition <span className="text-red-400">*</span>
                </label>
                <select
                  id="condition"
                  required
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900 bg-white"
                >
                  <option value="">Select your condition</option>
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="insurance" className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance type <span className="text-gray-400 text-xs font-normal">(optional)</span>
                </label>
                <select
                  id="insurance"
                  value={insuranceType}
                  onChange={(e) => setInsuranceType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900 bg-white"
                >
                  <option value="">Select insurance type</option>
                  {INSURANCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#0f1b44] text-white rounded-lg font-semibold hover:bg-[#1e3a6e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Joining...' : 'Get Early Access'}
              </button>

              <p className="text-center text-xs text-gray-400">
                No spam. We&apos;ll only email you about the tracker launch.
              </p>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/tracker/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>

          {/* Conversion prompt */}
          <div className="mt-8 p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-center">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold text-gray-800">Plus:</span> Our pharmacy program brings biologic costs to{' '}
              <span className="font-bold text-[#0f1b44]">$0/year</span>.
            </p>
            <Link
              href="/#check-savings"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Check your savings &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-gray-400 border-t border-gray-100">
        &copy; {new Date().getFullYear()} VITAL Health Technologies. All rights reserved.
      </footer>
    </div>
  );
}
