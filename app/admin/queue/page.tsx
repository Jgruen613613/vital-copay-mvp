"use client";

import { useEffect, useState } from "react";

interface Inquiry {
  id: number;
  email: string;
  preferred_call_time: string | null;
  insurance_type: string | null;
  consent_to_contact: boolean;
  status: string;
  specialist_notes: string | null;
  created_at: string;
}

const STATUS_OPTIONS = ["new", "contacted", "enrolled", "closed"];
const FILTER_OPTIONS = ["all", "new", "contacted", "enrolled", "closed"];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  enrolled: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const INSURANCE_LABELS: Record<string, string> = {
  commercial: "Commercial",
  medicare: "Medicare",
  medicaid: "Medicaid",
  dual_eligible: "Dual Eligible",
  uninsured: "Uninsured",
};

const CALL_TIME_LABELS: Record<string, string> = {
  morning: "Morning (9-12)",
  afternoon: "Afternoon (12-5)",
  evening: "Evening (5-8)",
  anytime: "Anytime",
};

export default function AdminQueuePage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<Record<number, string>>({});
  const [editNotes, setEditNotes] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);

  async function fetchInquiries() {
    const res = await fetch("/api/copay-inquiries");
    if (res.ok) {
      setInquiries(await res.json());
    }
  }

  useEffect(() => {
    fetchInquiries();
  }, []);

  const filtered =
    filter === "all"
      ? inquiries
      : inquiries.filter((inq) => inq.status === filter);

  function toggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      const inq = inquiries.find((i) => i.id === id);
      if (inq) {
        setEditStatus((prev) => ({ ...prev, [id]: inq.status }));
        setEditNotes((prev) => ({
          ...prev,
          [id]: inq.specialist_notes || "",
        }));
      }
    }
  }

  async function handleSave(id: number) {
    setSaving(id);
    const res = await fetch(`/api/copay-inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: editStatus[id],
        specialist_notes: editNotes[id],
      }),
    });
    if (res.ok) {
      await fetchInquiries();
    }
    setSaving(null);
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Enrollment Queue
          </h1>
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {filtered.length} total
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-[#1a365d] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No inquiries found.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((inq) => (
              <div
                key={inq.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Row */}
                <button
                  onClick={() => toggleExpand(inq.id)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50"
                >
                  <span className="text-xs text-gray-400 shrink-0 w-20">
                    {new Date(inq.created_at).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-gray-900 truncate">
                    {inq.email}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    {inq.preferred_call_time
                      ? CALL_TIME_LABELS[inq.preferred_call_time] || inq.preferred_call_time
                      : "—"}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    {inq.insurance_type
                      ? INSURANCE_LABELS[inq.insurance_type] || inq.insurance_type
                      : "—"}
                  </span>
                  <span
                    className={`ml-auto px-2 py-0.5 rounded text-xs font-medium shrink-0 ${
                      STATUS_COLORS[inq.status] || ""
                    }`}
                  >
                    {inq.status}
                  </span>
                </button>

                {/* Expanded detail */}
                {expandedId === inq.id && (
                  <div className="border-t border-gray-100 px-4 py-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Email:</span>{" "}
                        {inq.email}
                      </div>
                      <div>
                        <span className="text-gray-500">Preferred call time:</span>{" "}
                        {inq.preferred_call_time
                          ? CALL_TIME_LABELS[inq.preferred_call_time] || inq.preferred_call_time
                          : "Not specified"}
                      </div>
                      <div>
                        <span className="text-gray-500">Insurance:</span>{" "}
                        {inq.insurance_type
                          ? INSURANCE_LABELS[inq.insurance_type] || inq.insurance_type
                          : "Not specified"}
                      </div>
                      <div>
                        <span className="text-gray-500">Consent:</span>{" "}
                        {inq.consent_to_contact ? "Yes" : "No"}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        value={editStatus[inq.id] || inq.status}
                        onChange={(e) =>
                          setEditStatus((prev) => ({
                            ...prev,
                            [inq.id]: e.target.value,
                          }))
                        }
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <textarea
                        value={editNotes[inq.id] ?? inq.specialist_notes ?? ""}
                        onChange={(e) =>
                          setEditNotes((prev) => ({
                            ...prev,
                            [inq.id]: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>

                    <button
                      onClick={() => handleSave(inq.id)}
                      disabled={saving === inq.id}
                      className="px-4 py-2 bg-[#1a365d] text-white rounded-lg text-sm font-medium hover:bg-[#2a4a7f] disabled:opacity-50"
                    >
                      {saving === inq.id ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
