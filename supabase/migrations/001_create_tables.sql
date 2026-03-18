-- Table 1: medications
-- One row per specialty drug. Reference data only — no patient data.
CREATE TABLE medications (
  id SERIAL PRIMARY KEY,
  generic_name TEXT NOT NULL,
  brand_names JSONB NOT NULL DEFAULT '[]',
  drug_class TEXT NOT NULL,
  route_of_administration TEXT NOT NULL
    CHECK (route_of_administration IN ('oral','subcutaneous_injection','infusion')),
  is_biologic BOOLEAN NOT NULL DEFAULT false,
  is_biosimilar BOOLEAN NOT NULL DEFAULT false,
  average_wac_monthly DECIMAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 2: medication_assistance_programs
-- Every copay card, PAP, and foundation grant per drug.
CREATE TABLE medication_assistance_programs (
  id SERIAL PRIMARY KEY,
  medication_id INTEGER NOT NULL REFERENCES medications(id),
  program_name TEXT NOT NULL,
  program_type TEXT NOT NULL
    CHECK (program_type IN ('copay_card','pap','foundation_grant')),
  eligible_insurance_types JSONB NOT NULL DEFAULT '[]',
  eligibility_summary TEXT NOT NULL,
  estimated_monthly_savings TEXT NOT NULL,
  fund_status TEXT NOT NULL DEFAULT 'open'
    CHECK (fund_status IN ('open','closed','waitlist')),
  fund_status_last_checked TIMESTAMPTZ,
  application_url TEXT,
  application_method TEXT
    CHECK (application_method IN ('online','phone','fax',NULL)),
  renewal_frequency TEXT
    CHECK (renewal_frequency IN ('monthly','quarterly','annual','none',NULL)),
  source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual','rxutility','needymeds')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 3: copay_inquiries
-- One row per patient who taps "Get Help Enrolling." Lead table.
CREATE TABLE copay_inquiries (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  state_of_residence TEXT NOT NULL,
  insurance_type TEXT NOT NULL
    CHECK (insurance_type IN ('commercial','medicare_d','medicaid','uninsured')),
  medication_id INTEGER NOT NULL REFERENCES medications(id),
  matched_program_ids JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','contacted','enrolled','closed')),
  specialist_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
