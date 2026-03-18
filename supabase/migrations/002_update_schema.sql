-- Migration 002: Update schema for single-page PHI-avoidant architecture

-- Add new columns to medication_assistance_programs
ALTER TABLE medication_assistance_programs
  ADD COLUMN estimated_annual_savings TEXT NOT NULL DEFAULT '',
  ADD COLUMN likelihood_can_help TEXT NOT NULL DEFAULT '90-95%';

-- Recreate copay_inquiries with PHI-avoidant schema
-- No name, no medication_id, no matched_program_ids, no state_of_residence
DROP TABLE IF EXISTS copay_inquiries;

CREATE TABLE copay_inquiries (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  preferred_call_time TEXT,
  insurance_type TEXT
    CHECK (insurance_type IN ('commercial', 'medicare', 'medicaid', 'dual_eligible', 'uninsured', NULL)),
  consent_to_contact BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'enrolled', 'closed')),
  specialist_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- New table: waitlist_signups
CREATE TABLE waitlist_signups (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT DEFAULT 'coming_soon_page',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update insurance types: medicare_d → medicare, add dual_eligible
UPDATE medication_assistance_programs
  SET eligible_insurance_types = '["medicare","dual_eligible"]'
  WHERE eligible_insurance_types::text = '["medicare_d"]';

-- Update program data with annual savings and likelihood
UPDATE medication_assistance_programs SET
  estimated_monthly_savings = '$0 copay',
  estimated_annual_savings = 'Up to $20,000/yr',
  likelihood_can_help = '98-95%'
  WHERE program_name = 'AbbVie Complete' AND medication_id = 1;

UPDATE medication_assistance_programs SET
  estimated_monthly_savings = 'Free medication',
  estimated_annual_savings = 'Full cost covered',
  likelihood_can_help = '90-95%'
  WHERE program_name = 'AbbVie myAbbVie Assist';

UPDATE medication_assistance_programs SET
  estimated_monthly_savings = 'Up to $625/mo',
  estimated_annual_savings = 'Up to $7,500/yr',
  likelihood_can_help = '85-90%'
  WHERE program_name = 'PAN Foundation — RA';

UPDATE medication_assistance_programs SET
  estimated_monthly_savings = '$0 copay',
  estimated_annual_savings = 'Up to $12,000/yr',
  likelihood_can_help = '98-95%'
  WHERE program_name = 'Amgen FIRST STEP';

UPDATE medication_assistance_programs SET
  estimated_monthly_savings = 'Free medication',
  estimated_annual_savings = 'Full cost covered',
  likelihood_can_help = '90-95%'
  WHERE program_name = 'Amgen Safety Net Foundation';

UPDATE medication_assistance_programs SET
  estimated_monthly_savings = '$0 copay',
  estimated_annual_savings = 'Up to $15,000/yr',
  likelihood_can_help = '98-95%'
  WHERE program_name = 'Pfizer enCompass';

UPDATE medication_assistance_programs SET
  estimated_monthly_savings = 'Free medication',
  estimated_annual_savings = 'Full cost covered',
  likelihood_can_help = '90-95%'
  WHERE program_name = 'Pfizer RxPathways';

UPDATE medication_assistance_programs SET
  estimated_monthly_savings = '$0 copay',
  estimated_annual_savings = 'Up to $16,000/yr',
  likelihood_can_help = '98-95%'
  WHERE program_name = 'AbbVie Complete (Rinvoq)';

UPDATE medication_assistance_programs SET
  estimated_monthly_savings = 'Up to $833/mo',
  estimated_annual_savings = 'Up to $10,000/yr',
  likelihood_can_help = '85-90%'
  WHERE program_name = 'HealthWell Foundation — RA';

UPDATE medication_assistance_programs SET
  estimated_monthly_savings = '$0 copay',
  estimated_annual_savings = 'Up to $16,000/yr',
  likelihood_can_help = '98-95%'
  WHERE program_name = 'Novartis CoPay Card';

UPDATE medication_assistance_programs SET
  estimated_monthly_savings = 'Free medication',
  estimated_annual_savings = 'Full cost covered',
  likelihood_can_help = '90-95%'
  WHERE program_name = 'Novartis PAP';

UPDATE medication_assistance_programs SET
  estimated_monthly_savings = 'Up to $750/mo',
  estimated_annual_savings = 'Up to $9,000/yr',
  likelihood_can_help = '85-90%'
  WHERE program_name = 'CARF — Autoimmune';
