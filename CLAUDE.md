# VITAL Health Technologies — Copay Assistance MVP

What this app does: A patient enters their medication and insurance info, sees which copay assistance programs they qualify for with estimated savings, and gets connected to a medication access specialist who handles enrollment.

## Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Frontend | Next.js 14+ with App Router, TypeScript, Tailwind CSS | Production-grade React framework. Deploys to Vercel with one click. |
| Database | Supabase (PostgreSQL) | Real PostgreSQL you own. BAA available on Pro plan ($25/mo). Free tier for dev/testing. |
| Hosting | Vercel | Free tier. Auto-deploys from GitHub. Custom domain support. |
| Voice Agent | ElevenLabs widget embed | External script tag. Do not build custom voice infra. |
| AI | None in v1 | Manual program data. Claude API integration added later. |

## Architecture Principles

1. **Schema Is Strategy**: Name every table, field, and foreign key as if a senior engineer inherits this tomorrow. Use snake_case. Use explicit types. Add created_at timestamps everywhere.
2. **Logic Lives in the Backend**: All business logic in Supabase RPC functions or Next.js API routes. Frontend is presentation only.
3. **PHI Avoidance**: This app does NOT store PHI in v1. For MVP testing, use only fake data.
4. **Mobile-First**: All pages must render correctly on 375px wide screen (iPhone SE).

## Database Schema

Three tables in order (Table 2 references Table 1, Table 3 references Table 1):

### medications
```sql
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
```

### medication_assistance_programs
```sql
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
```

### copay_inquiries
```sql
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
```

## API Routes

1. **GET /api/medications/search** — Search medications by generic/brand name
2. **GET /api/programs/match** — Match programs by medication_id + insurance_type
3. **POST /api/copay-inquiries** — Create a lead
4. **GET /api/copay-inquiries** — List all inquiries for specialist queue
5. **PATCH /api/copay-inquiries/[id]** — Update inquiry status/notes

## Pages

1. **/** — Welcome / Intake form
2. **/results** — Program matches
3. **/enroll** — Contact info form
4. **/confirmation** — Success page
5. **/admin/queue** — Specialist enrollment queue

## Testing Checklist

| # | Test | Action | Expected Result |
|---|------|--------|----------------|
| 1 | Medication search | Type "Hum" | Dropdown shows Humira / adalimumab |
| 2 | Commercial matching | adalimumab + Commercial | Shows AbbVie Complete only |
| 3 | Medicare matching | adalimumab + Medicare | Shows PAN Foundation RA (waitlist) |
| 4 | No matches | any drug + Medicaid | Fallback message appears |
| 5 | Lead submission | Submit test@vital.com, 555-0100 | Confirmation page, new record |
| 6 | Specialist queue | /admin/queue | Inquiry visible, status persists |
| 7 | Mobile | 375px width | All pages render, no horizontal scroll |
