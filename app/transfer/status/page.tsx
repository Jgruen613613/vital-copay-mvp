"use client";

import { useState } from "react";
import Link from "next/link";
import type { Transfer, TransferStatus } from "@/lib/transfer-mock-data";
import { getTransferByEmail } from "@/lib/transfer-mock-data";

const STATUS_ORDER: TransferStatus[] = [
  "submitted",
  "eligibility_verified",
  "pharmacy_contacted",
  "prescriber_contacted",
  "pa_initiated",
  "pa_approved",
  "transfer_complete",
  "first_fill_shipped",
];

function getStatusIndex(status: TransferStatus): number {
  return STATUS_ORDER.indexOf(status);
}

export default function TransferStatusPage() {
  const [email, setEmail] = useState("");
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));
    const result = getTransferByEmail(email);
    setTransfer(result || null);
    setSearched(true);
    setLoading(false);
  }

  const currentIndex = transfer ? getStatusIndex(transfer.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1a365d] to-[#2a4a7f] text-white py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">
            VITAL Health
          </Link>
          <span className="text-blue-200 text-sm hidden sm:inline">Transfer Status</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Search form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Track Your Transfer</h1>
          <p className="text-gray-500 text-sm mb-6">
            Enter the email you used when submitting your transfer request.
          </p>

          <form onSubmit={handleSearch} className="flex gap-3">
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
              disabled={loading}
              className="px-6 py-3 bg-[#1a365d] text-white rounded-lg font-semibold hover:bg-[#2a4a7f] transition-colors text-sm whitespace-nowrap"
            >
              {loading ? "Searching..." : "Look Up"}
            </button>
          </form>

          {/* Demo hint */}
          <p className="text-xs text-gray-400 mt-3">
            Demo emails: sarah.m@example.com, james.r@example.com, maria.g@example.com
          </p>
        </div>

        {/* Not found */}
        {searched && !transfer && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 text-center">
            <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No Transfer Found</h2>
            <p className="text-gray-500 text-sm mb-4">
              We couldn&apos;t find a transfer associated with that email address.
              Please check the email and try again.
            </p>
            <Link
              href="/transfer"
              className="inline-block px-6 py-3 bg-[#1a365d] text-white rounded-lg font-medium hover:bg-[#2a4a7f] transition-colors text-sm"
            >
              Start a New Transfer
            </Link>
          </div>
        )}

        {/* Transfer found */}
        {transfer && (
          <>
            {/* Status overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{transfer.medication_name}</h2>
                  <p className="text-sm text-gray-500">Reference #VH-2026-{String(transfer.id).padStart(3, "0")}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  transfer.status === "transfer_complete" || transfer.status === "first_fill_shipped"
                    ? "bg-green-100 text-green-700"
                    : transfer.status === "exception"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-[#1a365d]"
                }`}>
                  {transfer.status === "transfer_complete" || transfer.status === "first_fill_shipped"
                    ? "Complete"
                    : transfer.status === "exception"
                    ? "Needs Attention"
                    : "In Progress"}
                </span>
              </div>

              {/* Savings badge */}
              {transfer.estimated_savings && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-green-800">Estimated savings: {transfer.estimated_savings}</p>
                      <p className="text-xs text-green-600">Through copay assistance programs</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Transfer Timeline</h3>
              <div className="space-y-0">
                {transfer.timeline.map((event, i) => {
                  const eventIndex = getStatusIndex(event.status);
                  const isCompleted = event.completed_at !== null;
                  const isCurrent = eventIndex === currentIndex && !isCompleted;
                  const isUpcoming = eventIndex > currentIndex;

                  return (
                    <div key={i} className="flex items-start gap-3 relative">
                      {/* Connector */}
                      {i < transfer.timeline.length - 1 && (
                        <div className={`absolute left-[11px] top-6 w-0.5 h-full ${
                          isCompleted ? "bg-green-300" : "bg-gray-200"
                        }`} />
                      )}

                      {/* Status icon */}
                      <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? "bg-green-500"
                          : isCurrent
                          ? "bg-[#1a365d] ring-4 ring-blue-100"
                          : "border-2 border-gray-300 bg-white"
                      }`}>
                        {isCompleted && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {isCurrent && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-6 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium text-sm ${
                            isCompleted ? "text-green-700" : isCurrent ? "text-[#1a365d] font-semibold" : "text-gray-400"
                          }`}>
                            {event.label}
                          </p>
                          {isCompleted && event.completed_at && (
                            <span className="text-xs text-gray-400">
                              {new Date(event.completed_at).toLocaleDateString("en-US", {
                                month: "short", day: "numeric"
                              })}
                            </span>
                          )}
                          {!isCompleted && event.estimated_completion && (
                            <span className="text-xs text-gray-400">
                              Est. {new Date(event.estimated_completion).toLocaleDateString("en-US", {
                                month: "short", day: "numeric"
                              })}
                            </span>
                          )}
                        </div>
                        {event.notes && (isCompleted || isCurrent) && (
                          <p className="text-xs text-gray-500 mt-0.5">{event.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Communication history */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Communication History</h3>
              <div className="space-y-3">
                {transfer.communications
                  .filter((c) => c.direction !== "internal")
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((comm) => (
                    <div key={comm.id} className="border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          comm.type === "sms"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-purple-50 text-purple-700"
                        }`}>
                          {comm.type === "sms" ? "Text" : "Email"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(comm.timestamp).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comm.message}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Help section */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 mb-2">Need help with your transfer?</p>
              <a
                href="tel:+18005551234"
                className="text-sm text-[#1a365d] font-medium hover:underline"
              >
                Call (800) 555-1234
              </a>
            </div>
          </>
        )}

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link href="/transfer" className="text-sm text-gray-500 hover:text-[#1a365d] transition-colors">
            Start a new transfer
          </Link>
        </div>
      </main>
    </div>
  );
}
