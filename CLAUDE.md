# VITAL Health Technologies — Copay Assistance MVP

What this app does: A patient enters their medication and insurance info, sees which copay assistance programs they qualify for with estimated savings, and gets connected to a medication access specialist who handles enrollment.

## Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Frontend | Next.js 14+ with App Router, TypeScript, Tailwind CSS | Production-grade React framework. Deploys to Vercel with one click. |
| Database | Supabase (PostgreSQL + Row Level Security) | Real PostgreSQL you own. BAA available on Pro plan ($25/mo). Free tier for dev/testing. |
| Hosting | Vercel (frontend) — Supabase handles backend | Free tier. Auto-deploys from GitHub. Custom domain support. |
| Voice Agent | ElevenLabs widget embed | External script tag. Do not build custom voice infra. |
| AI | None in v1 | Manual program data. Claude API integration added later. |

## Architecture Principles (NON-NEGOTIABLE)

1. **Schema Is Strategy**: Name every table, field, and foreign key as if a senior engineer inherits this tomorrow. Use snake_case. Use explicit types. Add created_at timestamps everywhere.
2. **Logic Lives in the Backend**: All business logic in Supabase RPC functions or Next.js API routes. Frontend is presentation only. Never compute eligibility matching or data validation in client-side code.
3. **PHI Avoidance**: This app does NOT store PHI in v1. Patient identity is never linked to medication data in the same stored record. The copay_inquiries table captures only email + contact preferences — NO name, NO medication data. The specialist asks about medication on the follow-up call.
4. **Mobile-First**: All pages must render correctly on 375px wide screen (iPhone SE). Test every page at mobile width.

## Database Schema

Four tables. Tables 1-3 created by migration 001, updated by migration 002. Table 4 added by migration 002.

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
  estimated_annual_savings TEXT NOT NULL,
  likelihood_can_help TEXT NOT NULL DEFAULT '90-95%',
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

### copay_inquiries (PHI-avoidant — no name, no medication data)
```sql
CREATE TABLE copay_inquiries (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  preferred_call_time TEXT,
  insurance_type TEXT
    CHECK (insurance_type IN ('commercial','medicare','medicaid','dual_eligible','uninsured',NULL)),
  consent_to_contact BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','contacted','enrolled','closed')),
  specialist_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### waitlist_signups
```sql
CREATE TABLE waitlist_signups (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT DEFAULT 'coming_soon_page',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Page Architecture

Single-page scrolling website with fixed navbar. Seven sections:

1. **Hero** — Blue gradient, headline, CTA, stats bar
2. **How It Works** — 3-step visual
3. **Check Savings** — Multi-step form (medication → insurance → results with specialist CTA)
4. **Coming Soon** — Feature teasers + email waitlist
5. **About** — Company info, founder credibility
6. **Footer** — Links + copyright

Separate admin page: **/admin/queue** — Specialist enrollment queue (not part of main site)

## API Routes

1. **GET /api/medications/search** — Search medications by generic/brand name
2. **GET /api/programs/match** — Match programs by medication_id + insurance_type (returns likelihood_can_help, estimated_annual_savings)
3. **POST /api/copay-inquiries** — Create lead (email, preferred_call_time, consent_to_contact only — NO name, NO medication)
4. **GET /api/copay-inquiries** — List all inquiries for specialist queue
5. **PATCH /api/copay-inquiries/[id]** — Update inquiry status/notes
6. **POST /api/waitlist** — Coming soon email signup

## Testing Checklist

| # | Test | Action | Expected Result |
|---|------|--------|----------------|
| 1 | Medication search | Type "Hum" | Dropdown shows Humira / adalimumab |
| 2 | Commercial matching | adalimumab + Commercial | Shows AbbVie Complete only |
| 3 | Medicare matching | adalimumab + Medicare | Shows PAN Foundation RA (waitlist) |
| 4 | Dual eligible matching | adalimumab + Dual Eligible | Shows PAN Foundation RA |
| 5 | Uninsured matching | adalimumab + Uninsured | Shows AbbVie myAbbVie Assist PAP |
| 6 | No matches | any drug + Medicaid | Fallback message appears |
| 7 | Contact form | Submit email + call time + consent | Record with NO medication data |
| 8 | Specialist queue | /admin/queue | Inquiry visible, status persists |
| 9 | Mobile | 375px width | All sections render, no horizontal scroll |
| 10 | ElevenLabs | Check floating button | Button visible on all sections |
| 11 | Nav links | Click nav items | Scroll to correct sections |
| 12 | Waitlist | Coming Soon email signup | Record created |
