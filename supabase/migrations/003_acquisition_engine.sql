-- Migration 003: Specialty Pharmacy Acquisition Engine
-- Adds: symptom tracker, prescription transfers, agent system, community monitoring

-- ============================================================
-- SYMPTOM TRACKER TABLES
-- ============================================================

-- Patient profiles for tracker (PHI-minimal: no name stored, auth via Supabase Auth)
CREATE TABLE tracker_profiles (
  id SERIAL PRIMARY KEY,
  auth_user_id UUID UNIQUE, -- Supabase Auth user ID
  email TEXT NOT NULL,
  display_name TEXT, -- optional, patient-chosen
  primary_condition TEXT CHECK (primary_condition IN (
    'rheumatoid_arthritis', 'psoriatic_arthritis', 'lupus',
    'ankylosing_spondylitis', 'sjogrens', 'vasculitis',
    'scleroderma', 'myositis', 'wound_care', 'other'
  )),
  diagnosis_year INTEGER,
  current_medications JSONB NOT NULL DEFAULT '[]',
  -- e.g. [{"name":"Humira","dose":"40mg","frequency":"biweekly","is_biologic":true}]
  providers JSONB NOT NULL DEFAULT '[]',
  -- e.g. [{"name":"Dr. Smith","specialty":"rheumatology","next_visit":"2026-04-15"}]
  insurance_type TEXT CHECK (insurance_type IN (
    'commercial','medicare','medicaid','dual_eligible','uninsured'
  )),
  pharmacy_status TEXT NOT NULL DEFAULT 'not_asked' CHECK (pharmacy_status IN (
    'not_asked', 'interested', 'transfer_initiated', 'active_patient', 'declined'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily symptom logs
CREATE TABLE symptom_logs (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES tracker_profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Pain & stiffness
  pain_score INTEGER CHECK (pain_score BETWEEN 0 AND 10),
  morning_stiffness_minutes INTEGER,
  -- Joint involvement (stored as JSON array of affected joint IDs)
  affected_joints JSONB NOT NULL DEFAULT '[]',
  -- e.g. ["left_hand","right_knee","left_shoulder"]
  -- Other symptoms
  fatigue_score INTEGER CHECK (fatigue_score BETWEEN 0 AND 10),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 0 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 0 AND 10),
  skin_involvement BOOLEAN DEFAULT false,
  skin_notes TEXT,
  wound_status TEXT CHECK (wound_status IN ('improving','stable','worsening', NULL)),
  -- Medication adherence
  medication_taken BOOLEAN,
  medication_time TIMESTAMPTZ,
  missed_dose_reason TEXT,
  -- Context
  notable_events TEXT, -- travel, illness, stress events
  free_text TEXT, -- "anything else today"
  -- Weather (auto-captured if permitted)
  weather_temp_f INTEGER,
  weather_humidity INTEGER,
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, log_date) -- one log per day per patient
);

-- Lab values (manual entry)
CREATE TABLE lab_entries (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES tracker_profiles(id) ON DELETE CASCADE,
  lab_date DATE NOT NULL,
  lab_type TEXT NOT NULL, -- 'CRP', 'ESR', 'RF', 'Anti-CCP', 'ANA', 'CBC', etc.
  value TEXT NOT NULL,
  unit TEXT,
  reference_range TEXT,
  is_abnormal BOOLEAN,
  claude_explanation TEXT, -- AI-generated plain-language explanation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Provider visit notes
CREATE TABLE visit_notes (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES tracker_profiles(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  provider_name TEXT,
  visit_type TEXT CHECK (visit_type IN ('rheumatology','primary_care','wound_care','other')),
  notes TEXT,
  medication_changes TEXT,
  next_steps TEXT,
  next_visit_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Claude-generated analysis summaries
CREATE TABLE tracker_analyses (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES tracker_profiles(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN (
    'weekly_summary', 'flare_alert', 'visit_prep', 'trend_report', 'conversion_prompt'
  )),
  period_start DATE,
  period_end DATE,
  summary_text TEXT NOT NULL,
  recommendations JSONB NOT NULL DEFAULT '[]',
  -- e.g. [{"text":"Ask about dose adjustment","priority":"high"}]
  data_points_analyzed INTEGER,
  conversion_prompt_shown BOOLEAN DEFAULT false,
  conversion_prompt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Provider visit prep documents (generated 48hrs before appointments)
CREATE TABLE visit_prep_documents (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES tracker_profiles(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  provider_name TEXT,
  -- Generated content
  symptom_trend_summary TEXT NOT NULL,
  flare_pattern_analysis TEXT,
  medication_adherence_summary TEXT,
  recommended_questions JSONB NOT NULL DEFAULT '[]',
  lab_trend_summary TEXT,
  -- Sharing
  share_token TEXT UNIQUE, -- for secure provider sharing link
  shared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRESCRIPTION TRANSFER TABLES
-- ============================================================

CREATE TABLE prescription_transfers (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES tracker_profiles(id),
  -- Patient info (minimal, collected during transfer)
  email TEXT NOT NULL,
  phone TEXT,
  state TEXT NOT NULL, -- US state abbreviation
  date_of_birth DATE,
  -- Medication info
  medication_name TEXT NOT NULL,
  current_dose TEXT,
  prescriber_name TEXT,
  prescriber_phone TEXT,
  current_pharmacy_name TEXT,
  current_pharmacy_phone TEXT,
  -- Insurance
  insurance_type TEXT CHECK (insurance_type IN (
    'commercial','medicare','medicaid','dual_eligible','uninsured'
  )),
  insurance_provider TEXT,
  member_id TEXT,
  -- Transfer status
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted',           -- patient completed form
    'eligibility_confirmed', -- we verified they qualify for $0
    'transfer_requested',   -- we contacted current pharmacy
    'prescriber_contacted', -- we reached out to prescriber
    'pa_initiated',         -- prior auth started
    'pa_approved',          -- PA approved
    'pa_denied',            -- PA denied (triggers appeal)
    'appeal_filed',         -- appeal in progress
    'transfer_complete',    -- Rx live at our pharmacy
    'first_fill_shipped',   -- first fill dispensed
    'cancelled',            -- patient cancelled
    'failed'                -- transfer failed
  )),
  status_history JSONB NOT NULL DEFAULT '[]',
  -- e.g. [{"status":"submitted","at":"2026-03-23T10:00:00Z","note":"Patient submitted form"}]
  -- Communication log
  communications JSONB NOT NULL DEFAULT '[]',
  -- e.g. [{"type":"sms","at":"...","message":"We've requested your prescription..."}]
  -- PA tracking
  pa_reference_number TEXT,
  pa_payer TEXT,
  pa_submitted_at TIMESTAMPTZ,
  pa_decision_at TIMESTAMPTZ,
  -- Specialist assignment
  assigned_specialist TEXT,
  specialist_notes TEXT,
  -- Estimated savings
  estimated_annual_savings TEXT,
  copay_program_matched TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AGENT SYSTEM TABLES
-- ============================================================

-- Agent definitions and configuration
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  agent_name TEXT NOT NULL UNIQUE,
  agent_type TEXT NOT NULL CHECK (agent_type IN (
    'community_monitor',
    'ad_optimizer',
    'tracker_analysis',
    'transfer_communications',
    'rheumatologist_outreach',
    'content_producer'
  )),
  description TEXT NOT NULL,
  schedule TEXT NOT NULL, -- cron-like: 'every_2h', 'daily', 'weekly', 'realtime', '3x_weekly'
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  -- Agent-specific configuration
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT CHECK (last_run_status IN ('success','partial','failed', NULL)),
  last_run_summary TEXT,
  total_runs INTEGER NOT NULL DEFAULT 0,
  total_items_processed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent run history
CREATE TABLE agent_runs (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN (
    'running','success','partial','failed','cancelled'
  )),
  items_processed INTEGER DEFAULT 0,
  items_flagged INTEGER DEFAULT 0,
  summary TEXT,
  output JSONB NOT NULL DEFAULT '{}',
  error_log TEXT,
  human_review_needed BOOLEAN DEFAULT false,
  human_review_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent-generated content queue (for human review)
CREATE TABLE agent_content_queue (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id),
  run_id INTEGER REFERENCES agent_runs(id),
  content_type TEXT NOT NULL CHECK (content_type IN (
    'community_response',   -- drafted response to community post
    'ad_creative',          -- new ad copy variant
    'ad_recommendation',    -- budget/targeting recommendation
    'patient_analysis',     -- tracker weekly summary
    'patient_alert',        -- flare or adherence alert
    'transfer_message',     -- patient communication during transfer
    'outreach_email',       -- rheumatologist outreach email
    'article',              -- blog/SEO article
    'social_post',          -- social media content
    'faq',                  -- FAQ entry
    'visit_prep'            -- provider visit prep doc
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  -- e.g. for community_response: {"platform":"reddit","subreddit":"rheumatoid","post_url":"...","urgency":"high"}
  -- e.g. for outreach_email: {"practice_name":"...","npi":"...","email":"...","sequence_step":1}
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent','high','normal','low')),
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN (
    'pending_review', 'approved', 'rejected', 'published', 'sent', 'scheduled'
  )),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Community monitoring data
CREATE TABLE community_posts (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN (
    'reddit','facebook','inspire','myra_team','mylupus_team','other'
  )),
  community_name TEXT NOT NULL, -- e.g. 'r/rheumatoid', 'RA Support Group'
  post_url TEXT,
  post_title TEXT,
  post_excerpt TEXT NOT NULL,
  author_username TEXT,
  post_date TIMESTAMPTZ,
  -- Classification
  topic_tags JSONB NOT NULL DEFAULT '[]',
  -- e.g. ["affordability","insurance_change","copay_help"]
  relevance_score INTEGER CHECK (relevance_score BETWEEN 0 AND 100),
  urgency TEXT CHECK (urgency IN ('critical','high','medium','low')),
  conversion_potential TEXT CHECK (conversion_potential IN ('high','medium','low')),
  -- Response tracking
  response_drafted BOOLEAN DEFAULT false,
  response_approved BOOLEAN DEFAULT false,
  response_posted BOOLEAN DEFAULT false,
  response_content_id INTEGER REFERENCES agent_content_queue(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rheumatologist outreach tracking
CREATE TABLE rheumatologist_practices (
  id SERIAL PRIMARY KEY,
  npi TEXT UNIQUE,
  practice_name TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  practice_type TEXT CHECK (practice_type IN ('solo','small_group','large_group','academic','hospital')),
  specialty TEXT DEFAULT 'rheumatology',
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  estimated_biologic_patients INTEGER,
  ehr_system TEXT, -- 'epic', 'cerner', 'athena', 'modernizing_medicine', 'other'
  -- Outreach status
  outreach_status TEXT NOT NULL DEFAULT 'not_contacted' CHECK (outreach_status IN (
    'not_contacted', 'email_1_sent', 'email_2_sent', 'email_3_sent',
    'responded_interested', 'responded_not_interested',
    'meeting_scheduled', 'active_partner', 'declined'
  )),
  outreach_history JSONB NOT NULL DEFAULT '[]',
  -- e.g. [{"step":"email_1","sent_at":"...","opened":true,"clicked":false}]
  priority_score INTEGER DEFAULT 50 CHECK (priority_score BETWEEN 0 AND 100),
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ad campaign tracking
CREATE TABLE ad_campaigns (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('meta','google','tiktok','other')),
  campaign_name TEXT NOT NULL,
  campaign_type TEXT CHECK (campaign_type IN ('offer_page','tracker','retargeting','lookalike')),
  target_audience TEXT NOT NULL,
  daily_budget DECIMAL,
  -- Performance metrics (updated by agent)
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  cost_per_lead DECIMAL,
  total_spend DECIMAL DEFAULT 0,
  conversion_rate DECIMAL,
  -- Creative tracking
  active_creatives JSONB NOT NULL DEFAULT '[]',
  winning_creatives JSONB NOT NULL DEFAULT '[]',
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft','active','paused','completed','archived'
  )),
  last_optimized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SEED AGENT DEFINITIONS
-- ============================================================

INSERT INTO agents (agent_name, agent_type, description, schedule, config) VALUES
(
  'Community Monitor',
  'community_monitor',
  'Scans patient communities every 2 hours for biologic affordability posts, pharmacy complaints, and copay discussions. Flags high-urgency posts and drafts empathetic responses for clinician review.',
  'every_2h',
  '{"platforms":["reddit","facebook","inspire","myra_team","mylupus_team"],"subreddits":["rheumatoid","lupus","PsoriaticArthritis","ankylosingspondylitis","Sjogrens","ChronicPain","AutoimmuneDisease","WoundCare"],"keywords":["copay","afford","cost","insurance","biologic cost","specialty pharmacy","prior auth","copay card","patient assistance"],"max_responses_per_run":20}'
),
(
  'Ad Optimizer',
  'ad_optimizer',
  'Daily analysis of Meta/Google campaign performance. Identifies winning vs losing creatives, recommends budget reallocation, and generates new ad copy variants based on top performers.',
  'daily',
  '{"platforms":["meta","google"],"daily_review_time":"09:00","auto_pause_threshold_cpl":35,"generate_variants_count":3,"optimization_metric":"cost_per_qualified_lead"}'
),
(
  'Tracker Analysis Engine',
  'tracker_analysis',
  'Real-time analysis of patient symptom logs. Generates 7-day summaries, flare alerts, visit prep documents, and contextual $0 copay conversion prompts based on medication tracking patterns.',
  'realtime',
  '{"weekly_summary_day":"sunday","flare_detection_threshold":{"pain_increase":2,"stiffness_increase":30},"visit_prep_hours_before":48,"conversion_prompts_enabled":true,"min_days_before_conversion":7}'
),
(
  'Transfer Communications',
  'transfer_communications',
  'Manages all patient communications throughout the prescription transfer lifecycle. Sends status updates, handles exceptions, and drafts personalized messages for each transfer stage.',
  'realtime',
  '{"sms_enabled":true,"email_enabled":true,"update_frequency_hours":24,"escalation_after_days":5,"auto_messages":{"submitted":"We''ve received your transfer request...","eligibility_confirmed":"Great news — you qualify for $0 copay...","transfer_requested":"We''ve contacted your pharmacy...","pa_approved":"Your prior authorization has been approved...","first_fill_shipped":"Your medication is on its way..."}}'
),
(
  'Rheumatologist Outreach',
  'rheumatologist_outreach',
  'Weekly batch outreach to rheumatology practices. Generates personalized emails, tracks opens/clicks, manages 3-touch follow-up sequences, and prioritizes practices by conversion potential.',
  'weekly',
  '{"batch_size":150,"sequence_steps":3,"days_between_steps":[0,8,21],"priority_factors":["solo_practice","high_biologic_volume","licensed_state"],"email_templates":["introduction","sample_pdf","final_followup"]}'
),
(
  'Content Producer',
  'content_producer',
  'Produces articles, FAQs, social content, and video scripts 3x/week. Sources topics from community questions, keyword gaps, and trending patient concerns.',
  '3x_weekly',
  '{"content_types":["article","faq","social_post"],"articles_per_week":2,"social_posts_per_week":5,"min_word_count":800,"seo_optimization":true,"topic_sources":["community_questions","keyword_gaps","trending_concerns"]}'
);
