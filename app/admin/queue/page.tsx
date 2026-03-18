"use client";

import { useEffect, useState } from "react";

interface MatchedProgram {
  program_name: string;
  fund_status: string;
}

interface Inquiry {
  id: number;
  first_name: string;
  email: string;
  phone: string;
  state_of_residence: string;
  insurance_type: string;
  medication_name: string;
  medication_brands: string[];
  matched_programs: MatchedProgram[];
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
                  ? "bg-blue-600 text-white"
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
                    {inq.first_name}
                  </span>
                  <span className="text-sm text-gray-500 truncate hidden sm:inline">
                    {inq.medication_brands?.[0] || inq.medication_name}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    {inq.insurance_type}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    {inq.state_of_residence}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    {inq.matched_programs?.length || 0} programs
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
                        <span className="text-gray-500">Phone:</span>{" "}
                        {inq.phone}
                      </div>
                      <div>
                        <span className="text-gray-500">Medication:</span>{" "}
                        {inq.medication_name} ({inq.medication_brands?.join(", ")})
                      </div>
                      <div>
                        <span className="text-gray-500">State:</span>{" "}
                        {inq.state_of_residence}
                      </div>
                    </div>

                    {inq.matched_programs && inq.matched_programs.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Matched Programs:
                        </p>
                        <ul className="text-sm space-y-1">
                          {inq.matched_programs.map((p, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  p.fund_status === "open"
                                    ? "bg-green-500"
                                    : p.fund_status === "waitlist"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                              />
                              {p.program_name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
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
