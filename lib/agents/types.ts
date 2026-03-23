// Shared TypeScript types for the VITAL Health agent system

export interface Agent {
  id: number;
  agent_name: string;
  agent_type:
    | 'community_monitor'
    | 'ad_optimizer'
    | 'tracker_analysis'
    | 'transfer_communications'
    | 'rheumatologist_outreach'
    | 'content_producer';
  description: string;
  schedule: string;
  is_active: boolean;
  config: Record<string, any>;
  last_run_at: string | null;
  last_run_status: 'success' | 'partial' | 'failed' | null;
  last_run_summary: string | null;
  total_runs: number;
  total_items_processed: number;
}

export interface AgentRun {
  id: number;
  agent_id: number;
  started_at: string;
  completed_at: string | null;
  status: 'running' | 'success' | 'partial' | 'failed' | 'cancelled';
  items_processed: number;
  items_flagged: number;
  summary: string | null;
  output: Record<string, any>;
  human_review_needed: boolean;
}

export interface ContentQueueItem {
  id: number;
  agent_id: number;
  content_type: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status:
    | 'pending_review'
    | 'approved'
    | 'rejected'
    | 'published'
    | 'sent'
    | 'scheduled';
  created_at: string;
}

export interface FlaggedPost {
  id: number;
  platform: 'reddit' | 'facebook' | 'inspire' | 'myra_team';
  community: string;
  author: string;
  title: string;
  excerpt: string;
  url: string;
  topic_tags: string[];
  relevance_score: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  conversion_potential: 'high' | 'medium' | 'low';
  detected_at: string;
  response_draft: string | null;
}

export interface AdCampaign {
  id: number;
  campaign_name: string;
  platform: 'meta' | 'google';
  status: 'active' | 'paused' | 'ended';
  daily_budget: number;
  impressions: number;
  clicks: number;
  leads: number;
  cpl: number;
  ctr: number;
  conversion_rate: number;
  spend_today: number;
  spend_total: number;
  best_performing_ad: string;
  audience_segment: string;
}

export interface AdVariant {
  id: number;
  headline: string;
  body: string;
  cta: string;
  target_audience: string;
  rationale: string;
}

export interface TrackerAnalysis {
  profile_id: string;
  period: string;
  pain_trend: { direction: 'improving' | 'stable' | 'worsening'; avg_score: number; delta: number };
  stiffness_pattern: { morning_avg_minutes: number; trend: string; worst_day: string };
  flare_risk: { level: 'low' | 'moderate' | 'high'; factors: string[]; recommendation: string };
  medication_adherence: { rate: number; missed_doses: number; pattern: string };
  recommended_actions: string[];
}

export interface RheumatologyPractice {
  id: number;
  npi: string;
  physician_name: string;
  practice_name: string;
  practice_type: 'solo' | 'group' | 'academic' | 'hospital_based';
  city: string;
  state: string;
  patient_volume: 'high' | 'medium' | 'low';
  outreach_status: 'not_contacted' | 'sequence_1' | 'sequence_2' | 'sequence_3' | 'responded' | 'meeting_scheduled' | 'partner';
  conversion_score: number;
  last_contacted_at: string | null;
  notes: string | null;
}

export interface OutreachEmail {
  subject: string;
  body: string;
  sequence_step: number;
  personalization_notes: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  outline: string[];
  keywords: string[];
  word_count: number;
  status: 'draft' | 'review' | 'approved' | 'published';
  seo_score: number;
}

export interface SocialPost {
  id: number;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
  content: string;
  hashtags: string[];
  image_prompt: string;
  scheduled_for: string | null;
  status: 'draft' | 'approved' | 'scheduled' | 'published';
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  source_community: string | null;
  priority: number;
}
