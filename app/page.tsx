"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
  "VT","VA","WA","WV","WI","WY",
];

const INSURANCE_OPTIONS = [
  { value: "commercial", label: "Commercial Insurance" },
  { value: "medicare_d", label: "Medicare" },
  { value: "medicaid", label: "Medicaid" },
  { value: "uninsured", label: "Uninsured / Self-Pay" },
];

interface Medication {
  id: number;
  generic_name: string;
  brand_names: string[];
  drug_class: string;
}

export default function IntakePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [state, setState] = useState("");
  const [insuranceType, setInsuranceType] = useState("");
  const [medQuery, setMedQuery] = useState("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isComplete = firstName && state && insuranceType && selectedMed;

  useEffect(() => {
    if (medQuery.length < 2 || selectedMed) {
      setMedications([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(
        `/api/medications/search?query=${encodeURIComponent(medQuery)}`
      );
      if (res.ok) {
        const data = await res.json();
        setMedications(data);
        setShowDropdown(true);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [medQuery, selectedMed]);

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

  function handleSubmit() {
    if (!isComplete) return;
    const params = new URLSearchParams({
      medication_id: String(selectedMed.id),
      insurance_type: insuranceType,
      first_name: firstName,
      state: state,
      med_name: selectedMed.brand_names[0] || selectedMed.generic_name,
    });
    router.push(`/results?${params.toString()}`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo & Tagline */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">VITAL</h1>
          <p className="text-gray-600 mt-2">
            Find savings on your specialty medication in 60 seconds
          </p>
        </div>

        {/* First Name */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* State Dropdown */}
        <div className="mb-4">
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select your state</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Insurance Type */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Insurance type
          </p>
          <div className="grid grid-cols-2 gap-2">
            {INSURANCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setInsuranceType(opt.value)}
                className={`py-3 px-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  insuranceType === opt.value
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Medication Search */}
        <div className="mb-6 relative" ref={dropdownRef}>
          <input
            type="text"
            placeholder="Search your medication..."
            value={medQuery}
            onChange={(e) => handleMedInputChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showDropdown && medications.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {medications.map((med) => (
                <button
                  key={med.id}
                  onClick={() => handleSelectMed(med)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                >
                  <span className="font-medium">
                    {med.brand_names[0]}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    ({med.generic_name})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className={`w-full py-4 rounded-lg text-lg font-semibold transition-colors ${
            isComplete
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Find My Savings
        </button>
      </div>
    </div>
  );
}
