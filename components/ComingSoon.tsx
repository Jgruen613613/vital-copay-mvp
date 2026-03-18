"use client";

import { useState } from "react";

export function ComingSoon() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Please enter a valid email.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  const features = [
    { title: "Symptom Tracking", desc: "Monitor how your medication is working over time" },
    { title: "Health Score", desc: "Personalized wellness insights powered by your data" },
    { title: "Telemedicine", desc: "Connect with specialists from the comfort of home" },
  ];

  return (
    <section id="coming-soon" className="py-16 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Coming Soon
        </h2>
        <p className="text-gray-500 mb-8">
          We&apos;re building more tools to help you manage your health
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-md mx-auto">
          <p className="font-medium text-gray-700 mb-3">Get notified when new features launch</p>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">You&apos;re on the list!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#1a365d] text-white rounded-lg font-medium hover:bg-[#2a4a7f] transition-colors text-sm whitespace-nowrap"
              >
                Notify Me
              </button>
            </form>
          )}
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </section>
  );
}
