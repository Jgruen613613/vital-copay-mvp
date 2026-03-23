-- Seed data for operations schema
-- Execution milestones for the 90-day plan

-- ============================================
-- PHASE 1: FOUNDATION & FIRST REVENUE (Days 1-21)
-- ============================================
INSERT INTO execution_milestones (phase, day_start, day_end, title, description, category, status, target_metric) VALUES
(1, 1, 1, 'Infrastructure Setup', 'Register domain, Instantly.ai, Apollo.io, Stripe. Build Framer site. Configure Claude agent stack.', 'infrastructure', 'pending', '$487 spent, all tools live'),
(1, 1, 1, 'Service Packaging', 'Define 3 service tiers: Starter ($5K), Growth ($8.5K), Scale ($15K). Write positioning copy and one-page site.', 'agency', 'pending', '3 packages defined with pricing'),
(1, 1, 3, 'Knowledge Base Bootstrap', 'Build Healthcare IT + Rheumatology knowledge base. Populate 50+ entities: vendors, regulations, clinical protocols, market dynamics.', 'knowledge_base', 'pending', '50+ KB entries with verified accuracy'),
(1, 1, 3, 'SaaS Scaffold', 'Claude Code builds Next.js + Supabase + Stripe application. Auth, billing, dashboard shell, lead processing API.', 'saas', 'pending', 'Deployed to Vercel, auth + billing working'),
(1, 2, 7, 'First Prospect Outreach', 'Identify 20 prospects with switching intent. Produce 5 free sample articles. Send first outreach batch.', 'agency', 'pending', '5 samples sent, first responses received'),
(1, 2, 7, 'Community Warm Channel', 'Post offers in Indie Hackers, relevant Slack groups, Twitter/X. Target: first 5 clients from warm channels.', 'gtm', 'pending', '3-5 clients closed at $1,500-$3,500'),
(1, 3, 7, 'GTM Agent Activation', 'Deploy GTM Monitor agent. Begin monitoring Reddit, LinkedIn, HN for Healthcare IT pain signals. Queue 30-50 replies/day.', 'gtm', 'pending', '150+ community engagements queued'),
(1, 4, 21, 'Daily Agent Operations', 'Full autonomous cycle: KB updates 6AM, lead intel 8AM, human review 9AM, sample production 10AM, delivery 3PM, QA 4PM.', 'agency', 'pending', '75 min/day human time maintained'),
(1, 8, 21, 'Scale Outbound', 'Outbound sending 200-400 emails/day. Domain warming complete. Target: 10-20 active clients by Day 21.', 'agency', 'pending', '10-20 clients, $48K-$90K revenue'),
(1, 8, 21, 'SaaS Core Build', 'Personalization engine, Healthcare IT KB API integration, white-label config for future licensing.', 'saas', 'pending', 'Core features complete, internal testing');

-- ============================================
-- PHASE 2: COMPOUNDING ENGINE (Days 22-55)
-- ============================================
INSERT INTO execution_milestones (phase, day_start, day_end, title, description, category, status, target_metric) VALUES
(2, 22, 30, 'Agency Insider Recruitment', 'Identify 40 account managers at Healthcare IT content agencies. Send referral program outreach. Target: 4-6 active partners.', 'agency', 'pending', '4-6 referral partners, first referrals incoming'),
(2, 22, 55, 'LinkedIn Authority Build', 'Daily LinkedIn posts: Mon=contrarian, Wed=data/insight, Fri=tactical. Draw from KB. Target: 2,000-5,000 followers.', 'gtm', 'pending', '2,000+ followers, 3-8 inbound demos/week'),
(2, 22, 40, 'SaaS Polish', 'UI polish, onboarding flow, usage metering, documentation. White-label configuration for licensees.', 'saas', 'pending', 'Production-ready for licensing bundle'),
(2, 30, 45, 'Price Escalation', 'Raise new client rates: Growth → $8,500/mo, Scale → $15,000/mo. Existing clients grandfathered.', 'agency', 'pending', 'New clients at higher rates, no pushback'),
(2, 22, 55, 'Referral Engine', 'Activate client referral program. Clients who refer get one free month. Target: 25-40 active clients by Day 55.', 'agency', 'pending', '25-40 clients, $80K-$180K MRR'),
(2, 40, 55, 'Licensing Package Production', 'Claude produces: Operations Manual (70-90 pages), Prompt Library, Technical Package, KB Transfer docs, Support structure.', 'licensing', 'pending', 'Complete licensing package ready'),
(2, 45, 55, 'Licensing Prospect List', 'Identify 200 independent healthcare marketing consultants and fractional CMOs. Build personalized outreach for each.', 'licensing', 'pending', '200 prospects identified and researched');

-- ============================================
-- PHASE 3: THE PUSH TO $1M (Days 56-90)
-- ============================================
INSERT INTO execution_milestones (phase, day_start, day_end, title, description, category, status, target_metric) VALUES
(3, 56, 60, 'Performance Pricing Shift', 'Move agency to performance model: $2,500/mo base + $500 per booked meeting. Target: 15 clients on new model.', 'agency', 'pending', '15 performance clients at $6,500-$10K/mo'),
(3, 60, 62, 'Licensing Event Launch', 'Begin outreach to 200 licensing prospects. LinkedIn connections + personalized emails.', 'licensing', 'pending', 'All 200 prospects contacted'),
(3, 63, 80, 'Licensing Demos', 'Conduct 40-60 demo calls. 30-min structure: situation → live demo → manual walkthrough → tier selection.', 'licensing', 'pending', '40-60 demos completed'),
(3, 80, 85, 'Licensing Proposals', 'Send proposals with 3-tier pricing. Operator $8,500 / Builder $22,500 / Partner $45,000. Payment plan options.', 'licensing', 'pending', 'Proposals sent to all interested prospects'),
(3, 85, 90, 'Licensing Close', 'Close licensing deals. Target: 12 Operator + 7 Builder + 3 Partner = $394,500-$558,000.', 'licensing', 'pending', '$394K-$558K licensing revenue closed'),
(3, 60, 90, 'Agency Phase 3 Revenue', 'Continue agency operations with performance pricing. Maintain 30-40 active clients.', 'agency', 'pending', '$80K-$160K additional agency revenue'),
(3, 90, 90, 'Final Scorecard', 'Total 90-day revenue assessment. Target: $733,500-$1,216,000. P($1M) ≈ 67%.', 'agency', 'pending', 'Total revenue calculated and reported');
