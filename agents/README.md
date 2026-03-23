# Zoe Launch Agents

A set of orchestrated Claude Code agents that manage every aspect of launching and running the Zoe fragrance business. Designed to be used by someone with no technical skills.

## How to Use

Each agent is a prompt file you can run in Claude Code using the `/user` command or by pasting into a Claude Code session. They are designed to be self-contained and actionable.

## Available Agents

### 1. Launch Commander (`launch-commander.md`)
The master orchestrator. Run this first. It coordinates all other agents and tracks overall launch progress across the 30-day sprint.

### 2. Perfumer Finder (`perfumer-finder.md`)
Finds, evaluates, and helps you contract with indie perfumers. Generates outreach messages, evaluates responses, and drafts contracts.

### 3. Brand & Design (`brand-design.md`)
Manages all brand assets — logo concepts, color palette, label design, packaging specs, and brand voice guidelines.

### 4. Quiz Optimizer (`quiz-optimizer.md`)
Analyzes quiz submissions, identifies patterns in responses, and suggests improvements to questions for better preference mapping.

### 5. Brief Quality Checker (`brief-quality-checker.md`)
Reviews AI-generated perfumer briefs for specificity, chemical accuracy, and actionability. Flags generic or inconsistent briefs.

### 6. Customer Ops (`customer-ops.md`)
Manages the customer pipeline — tracks submissions, generates shipping labels, schedules follow-up emails, and monitors feedback.

### 7. Financial Tracker (`financial-tracker.md`)
Tracks all spending, calculates unit economics, projects runway, and generates simple financial reports.

### 8. Marketing & Launch (`marketing-launch.md`)
Writes Reddit posts, social media content, email sequences, and manages the waitlist communications.

### 9. Compliance (`compliance.md`)
Tracks IFRA compliance status, allergen labeling requirements, and regulatory checklist for each formula.

### 10. Test & Build (`test-build.md`)
Runs the app's test suite, checks for build errors, validates all API routes, and ensures the platform is production-ready.
