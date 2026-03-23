-- Migration 003: Operations Schema for Debate Panel Business Execution
-- Tables for: prospects, clients, knowledge base, agent runs, licensing pipeline

-- ============================================
-- PROSPECTS: Companies showing switching intent
-- ============================================
CREATE TABLE prospects (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_linkedin TEXT,
  signal_type TEXT NOT NULL
    CHECK (signal_type IN ('clutch_review','linkedin_post','job_posting','agency_churn','referral','inbound','community')),
  signal_text TEXT,
  estimated_monthly_spend DECIMAL,
  switching_intent_score INTEGER CHECK (switching_intent_score BETWEEN 1 AND 10),
  vertical TEXT NOT NULL DEFAULT 'healthcare_it'
    CHECK (vertical IN ('healthcare_it','rheumatology','wound_care','specialty_pharma','digital_health')),
  status TEXT NOT NULL DEFAULT 'identified'
    CHECK (status IN ('identified','sample_sent','responded','meeting_booked','proposal_sent','closed_won','closed_lost','nurturing')),
  sample_article_title TEXT,
  sample_sent_at TIMESTAMPTZ,
  notes TEXT,
  source_agent TEXT DEFAULT 'manual'
    CHECK (source_agent IN ('manual','gtm_monitor','lead_researcher','insider_referral')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CLIENTS: Active agency clients
-- ============================================
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER REFERENCES prospects(id),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  vertical TEXT NOT NULL DEFAULT 'healthcare_it'
    CHECK (vertical IN ('healthcare_it','rheumatology','wound_care','specialty_pharma','digital_health')),
  package_tier TEXT NOT NULL
    CHECK (package_tier IN ('starter','growth','scale','performance')),
  monthly_rate DECIMAL NOT NULL,
  contract_start DATE NOT NULL,
  contract_end DATE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','paused','churned','upgraded')),
  deliverables_completed INTEGER DEFAULT 0,
  total_revenue DECIMAL DEFAULT 0,
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- KNOWLEDGE BASE: Vertical intelligence entries
-- ============================================
CREATE TABLE knowledge_base_entries (
  id SERIAL PRIMARY KEY,
  vertical TEXT NOT NULL
    CHECK (vertical IN ('healthcare_it','rheumatology','wound_care','specialty_pharma','digital_health')),
  category TEXT NOT NULL
    CHECK (category IN ('funding','product_launch','regulation','competitor_intel','clinical_research','market_trend','vendor_analysis','patient_insight')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  full_content TEXT,
  source_url TEXT,
  relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 10),
  tags JSONB NOT NULL DEFAULT '[]',
  agent_generated BOOLEAN NOT NULL DEFAULT true,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- AGENT RUNS: Tracking autonomous agent executions
-- ============================================
CREATE TABLE agent_runs (
  id SERIAL PRIMARY KEY,
  agent_type TEXT NOT NULL
    CHECK (agent_type IN ('gtm_monitor','lead_researcher','knowledge_updater','sample_producer','licensing_pipeline','content_engine')),
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running','completed','failed','pending_review')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  items_processed INTEGER DEFAULT 0,
  items_requiring_review INTEGER DEFAULT 0,
  summary TEXT,
  error_message TEXT,
  config JSONB DEFAULT '{}',
  output JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- AGENT QUEUE: Items needing human review
-- ============================================
CREATE TABLE agent_review_queue (
  id SERIAL PRIMARY KEY,
  agent_run_id INTEGER REFERENCES agent_runs(id),
  agent_type TEXT NOT NULL,
  item_type TEXT NOT NULL
    CHECK (item_type IN ('gtm_reply','outreach_email','client_deliverable','linkedin_post','sample_article','licensing_outreach','knowledge_entry')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_platform TEXT,
  target_prospect_id INTEGER REFERENCES prospects(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','edited')),
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- ============================================
-- LICENSING PROSPECTS: Pipeline for licensing event
-- ============================================
CREATE TABLE licensing_prospects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  linkedin_url TEXT,
  email TEXT,
  follower_count INTEGER,
  recent_post_topic TEXT,
  vertical_focus TEXT,
  tier_interest TEXT
    CHECK (tier_interest IN ('operator','builder','partner', NULL)),
  stage TEXT NOT NULL DEFAULT 'identified'
    CHECK (stage IN ('identified','outreach_sent','replied','demo_booked','demo_completed','proposal_sent','negotiating','closed_won','closed_lost')),
  deal_value DECIMAL,
  outreach_message TEXT,
  demo_date TIMESTAMPTZ,
  proposal_sent_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- REVENUE TRACKING: Daily revenue snapshots
-- ============================================
CREATE TABLE revenue_entries (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  source TEXT NOT NULL
    CHECK (source IN ('agency','licensing','saas','appsumo','other')),
  amount DECIMAL NOT NULL,
  description TEXT,
  client_id INTEGER REFERENCES clients(id),
  licensing_prospect_id INTEGER REFERENCES licensing_prospects(id),
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- EXECUTION MILESTONES: 90-day plan tracking
-- ============================================
CREATE TABLE execution_milestones (
  id SERIAL PRIMARY KEY,
  phase INTEGER NOT NULL CHECK (phase IN (1, 2, 3)),
  day_start INTEGER NOT NULL,
  day_end INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL
    CHECK (category IN ('agency','saas','licensing','gtm','knowledge_base','infrastructure')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','completed','blocked','skipped')),
  target_metric TEXT,
  actual_metric TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_prospects_vertical ON prospects(vertical);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_kb_vertical_category ON knowledge_base_entries(vertical, category);
CREATE INDEX idx_agent_runs_type ON agent_runs(agent_type);
CREATE INDEX idx_review_queue_status ON agent_review_queue(status);
CREATE INDEX idx_licensing_stage ON licensing_prospects(stage);
CREATE INDEX idx_revenue_date ON revenue_entries(date);
CREATE INDEX idx_milestones_phase ON execution_milestones(phase);
