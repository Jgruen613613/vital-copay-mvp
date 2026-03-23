-- Zoe Fragrance Platform — Database Schema
-- Migration 003: Create Zoe tables

-- Quiz submissions: stores all 28 answers + generated brief
CREATE TABLE zoe_quiz_submissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  fragrance_name TEXT,
  answers JSONB NOT NULL DEFAULT '{}',
  mood_board_notes JSONB DEFAULT '[]',
  generated_brief TEXT,
  brief_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (brief_status IN ('pending', 'generating', 'ready', 'assigned', 'formula_ready', 'shipped')),
  perfumer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sample feedback: ratings for each formula vial
CREATE TABLE zoe_feedback (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES zoe_quiz_submissions(id),
  formula_01_ratings JSONB DEFAULT '{}',
  formula_02_ratings JSONB DEFAULT '{}',
  formula_03_ratings JSONB DEFAULT '{}',
  adjustment_request TEXT,
  wants_full_bottle BOOLEAN DEFAULT false,
  preferred_formula INTEGER CHECK (preferred_formula IN (1, 2, 3)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Zoe waitlist signups (separate from copay waitlist)
CREATE TABLE zoe_waitlist (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT DEFAULT 'landing_page',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Formula library: perfumer's base formulas
CREATE TABLE zoe_formulas (
  id SERIAL PRIMARY KEY,
  formula_name TEXT NOT NULL,
  olfactive_family TEXT NOT NULL,
  description TEXT,
  top_notes JSONB DEFAULT '[]',
  heart_notes JSONB DEFAULT '[]',
  base_notes JSONB DEFAULT '[]',
  concentration_pct DECIMAL DEFAULT 17.0,
  ifra_compliant BOOLEAN DEFAULT false,
  created_by TEXT DEFAULT 'perfumer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_zoe_quiz_email ON zoe_quiz_submissions(email);
CREATE INDEX idx_zoe_quiz_status ON zoe_quiz_submissions(brief_status);
CREATE INDEX idx_zoe_feedback_submission ON zoe_feedback(submission_id);
