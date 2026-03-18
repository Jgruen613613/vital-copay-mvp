"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Program {
  id: number;
  program_name: string;
  program_type: string;
  estimated_monthly_savings: string;
  eligibility_summary: string;
  fund_status: string;
}

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  copay_card: { label: "Copay Card", color: "bg-green-100 text-green-800" },
  pap: { label: "Patient Assistance", color: "bg-blue-100 text-blue-800" },
  foundation_grant: { label: "Foundation Grant", color: "bg-orange-100 text-orange-800" },
};

const STATUS_DOTS: Record<string, { color: string; label: string }> = {
  open: { color: "bg-green-500", label: "Open" },
  waitlist: { color: "bg-yellow-500", label: "Waitlist" },
  closed: { color: "bg-red-500", label: "Closed" },
};

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const medicationId = searchParams.get("medication_id");
  const insuranceType = searchParams.get("insurance_type");
  const medName = searchParams.get("med_name") || "your medication";
  const firstName = searchParams.get("first_name") || "";
  const stateParam = searchParams.get("state") || "";

  const insuranceLabel: Record<string, string> = {
    commercial: "Commercial",
    medicare_d: "Medicare",
    medicaid: "Medicaid",
    uninsured: "Uninsured",
  };

  useEffect(() => {
    if (!medicationId || !insuranceType) return;
    async function fetchPrograms() {
      const res = await fetch(
        `/api/programs/match?medication_id=${medicationId}&insurance_type=${insuranceType}`
      );
      if (res.ok) {
        setPrograms(await res.json());
      }
      setLoading(false);
    }
    fetchPrograms();
  }, [medicationId, insuranceType]);

  function handleEnroll() {
    const params = new URLSearchParams({
      medication_id: medicationId || "",
      insurance_type: insuranceType || "",
      first_name: firstName,
      state: stateParam,
      matched_program_ids: JSON.stringify(programs.map((p) => p.id)),
    });
    router.push(`/enroll?${params.toString()}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Finding savings programs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-blue-600 text-sm mb-4 inline-block">
          ← Back
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Savings programs for {medName}
        </h1>
        <p className="text-gray-500 mb-6">
          Based on your {insuranceLabel[insuranceType || ""] || insuranceType} coverage
        </p>

        {programs.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <p className="text-gray-700">
              We&apos;re researching assistance options for your medication.
              Enter your info below and a specialist will help.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {programs.map((program) => {
              const badge = TYPE_BADGES[program.program_type];
              const status = STATUS_DOTS[program.fund_status];
              return (
                <div
                  key={program.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900">
                      {program.program_name}
                    </h3>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${status?.color}`}
                      />
                      <span className="text-xs text-gray-500">
                        {status?.label}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${badge?.color}`}
                  >
                    {badge?.label}
                  </span>

                  <p className="text-xl font-bold text-green-700 mb-1">
                    {program.estimated_monthly_savings}
                  </p>
                  <p className="text-sm text-gray-600">
                    {program.eligibility_summary}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={handleEnroll}
          className="w-full py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Get Help Enrolling
        </button>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
