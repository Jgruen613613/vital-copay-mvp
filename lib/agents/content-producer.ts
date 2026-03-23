import { ContentQueueItem } from "./types";

// ============================================================
// AGENT 6: CONTENT PRODUCER
// Produces articles, FAQs, social content 3x/week
// Sources topics from community questions + keyword gaps
// ============================================================

export interface TopicIdea {
  title: string;
  content_type: "article" | "faq" | "social_post" | "video_script";
  source: "community_question" | "keyword_gap" | "trending_concern";
  priority: "high" | "medium" | "low";
  target_keywords: string[];
  estimated_word_count?: number;
  notes: string;
}

export interface ArticleDraft {
  title: string;
  slug: string;
  meta_description: string;
  outline: string[];
  full_draft: string;
  word_count: number;
  target_keywords: string[];
  seo_difficulty: "low" | "medium" | "high";
}

export interface SocialPost {
  platform: "instagram" | "facebook" | "twitter" | "tiktok" | "linkedin";
  format: "text_post" | "carousel" | "video_script" | "story";
  content: string;
  hashtags: string[];
  estimated_engagement: "high" | "medium" | "low";
  best_post_time: string;
}

export interface FAQ {
  question: string;
  answer: string;
  source: string;
  category: "copay" | "medication" | "insurance" | "transfer" | "tracker" | "general";
}

// Topic queue sourced from community + keywords
const topicQueue: TopicIdea[] = [
  {
    title: "Why Your Biologic Costs $5,000/Year (And How to Pay $0)",
    content_type: "article",
    source: "keyword_gap",
    priority: "high",
    target_keywords: ["biologic cost", "copay assistance", "humira cost", "specialty pharmacy savings"],
    estimated_word_count: 1800,
    notes: "Core conversion article. Target high-volume affordability keywords.",
  },
  {
    title: "Morning Stiffness Lasting Over 30 Minutes? What Your Body Is Telling You",
    content_type: "article",
    source: "community_question",
    priority: "high",
    target_keywords: ["RA morning stiffness", "rheumatoid arthritis symptoms", "inflammatory arthritis signs"],
    estimated_word_count: 2200,
    notes: "Sourced from 47 community posts asking about stiffness duration. High search volume.",
  },
  {
    title: "What ANA Positive Actually Means (And When to Worry)",
    content_type: "article",
    source: "community_question",
    priority: "medium",
    target_keywords: ["ANA positive meaning", "ANA test results", "autoimmune blood test"],
    estimated_word_count: 1500,
    notes: "One of the most-asked questions in lupus + RA communities.",
  },
  {
    title: "Copay Card vs Patient Assistance vs Foundation Grant: What's the Difference?",
    content_type: "article",
    source: "keyword_gap",
    priority: "high",
    target_keywords: ["copay card vs patient assistance", "biologic financial assistance", "prescription cost help"],
    estimated_word_count: 2000,
    notes: "Confusion between programs is a major barrier. This article ranks for comparison queries.",
  },
  {
    title: "Your Wound Isn't Healing Because Nobody Checked for This",
    content_type: "article",
    source: "trending_concern",
    priority: "medium",
    target_keywords: ["non-healing wound causes", "autoimmune wound", "pyoderma gangrenosum"],
    estimated_word_count: 1800,
    notes: "Wound care crossover content. Targets patients who haven't connected wounds to autoimmune disease.",
  },
];

const sampleArticles: ArticleDraft[] = [
  {
    title: "Why Your Biologic Costs $5,000/Year (And How to Pay $0)",
    slug: "biologic-cost-zero-copay",
    meta_description: "Learn how specialty pharmacies combine manufacturer programs, foundation grants, and pharmacy-level support to bring biologic medication costs from $5,000/year to $0.",
    outline: [
      "The real cost of biologics with insurance",
      "Why most patients don't know about assistance programs",
      "Layer 1: Manufacturer copay programs",
      "Layer 2: Patient assistance foundations",
      "Layer 3: Specialty pharmacy programs",
      "The math: how stacking brings cost to $0",
      "How to check if you qualify (60-second process)",
    ],
    full_draft: `## Why Your Biologic Costs $5,000/Year (And How to Pay $0)

If you're on a biologic medication for rheumatoid arthritis, psoriatic arthritis, or another autoimmune condition, you already know the financial reality: these medications can cost $5,000 to $10,000 per year in out-of-pocket costs, even with insurance.

But here's what most patients don't know: there are programs — available right now — that can bring that cost to zero. Not $50. Not $100. Zero.

### The Three Layers of Cost Coverage

**Layer 1: Manufacturer Copay Programs**
Every major biologic manufacturer runs a copay assistance program. AbbVie (Humira), Amgen (Enbrel), Novartis (Cosentyx), and others offer copay cards that can reduce your out-of-pocket by 60-80%. For commercially insured patients, these alone can bring monthly costs from $400+ to under $50.

**Layer 2: Patient Assistance Foundations**
Organizations like the PAN Foundation, HealthWell Foundation, and the Chronic Disease Fund maintain dedicated funds for autoimmune conditions. For Medicare patients (where manufacturer copay cards don't apply), these foundations are the primary cost-coverage mechanism.

**Layer 3: Specialty Pharmacy Programs**
Some specialty pharmacies have built systems that identify and stack every available assistance program for each patient's specific situation — manufacturer programs, foundation grants, state programs, and their own pharmacy-level support — to cover the remaining gap.

### The Math

| | Average Cost |
|---|---|
| Annual biologic cost with insurance | $6,800 |
| After manufacturer copay card | $1,200 |
| After foundation grant | $200 |
| After pharmacy program | **$0** |

### Why Don't More Patients Know About This?

Three reasons:
1. **Fragmentation**: Programs are run by different organizations with different applications, eligibility criteria, and renewal schedules
2. **Complexity**: Stacking multiple programs requires understanding how they interact with each other and with your specific insurance plan
3. **Time**: Managing enrollment, renewals, and status changes across multiple programs is a part-time job

This is exactly what specialty pharmacy copay assistance programs solve. One pharmacy manages all the layers, handles all the paperwork, and keeps your cost at $0 permanently.

### Check If You Qualify

It takes 60 seconds. You'll need your medication name and insurance type. No obligation, no sales call.

[Check eligibility →]`,
    word_count: 1800,
    target_keywords: ["biologic cost", "copay assistance", "humira cost", "specialty pharmacy savings"],
    seo_difficulty: "medium",
  },
];

const sampleSocialPosts: SocialPost[] = [
  {
    platform: "instagram",
    format: "text_post",
    content: "If your morning stiffness lasts more than 30 minutes, that's not normal aging.\n\nThat's a clinical red flag your primary care doctor should hear about.\n\n30+ minutes of morning stiffness is one of the key diagnostic criteria for inflammatory arthritis.\n\nYou deserve answers, not dismissal.",
    hashtags: ["RheumatoidArthritis", "ChronicIllness", "Autoimmune", "RAWarrior", "InvisibleIllness"],
    estimated_engagement: "high",
    best_post_time: "7:00 AM EST",
  },
  {
    platform: "facebook",
    format: "text_post",
    content: "\"My insurance changed and my Humira went from $5 to $400/month.\"\n\nWe hear this every single week. And every single time, we're able to bring that cost back to $0.\n\nHere's how:\n\n1. We check which manufacturer programs still apply under your new plan\n2. We apply to patient assistance foundations on your behalf\n3. We cover any remaining gap through our pharmacy program\n\nResult: $0 copay. Every fill. Every month.\n\nIf this is happening to you right now, check eligibility in 60 seconds: [link]",
    hashtags: ["CopayAssistance", "BiologicMedication", "RACommunity"],
    estimated_engagement: "high",
    best_post_time: "12:00 PM EST",
  },
  {
    platform: "instagram",
    format: "carousel",
    content: "Slide 1: Your biologic costs $5,000/year\nSlide 2: But there are programs that bring it to $0\nSlide 3: Manufacturer copay cards (-$4,000)\nSlide 4: Patient assistance foundations (-$800)\nSlide 5: Pharmacy programs (-$200)\nSlide 6: Total out of pocket: $0\nSlide 7: Check if you qualify → link in bio",
    hashtags: ["BiologicCost", "CopayHelp", "RA", "PsoriaticArthritis", "AutoimmuneLife"],
    estimated_engagement: "high",
    best_post_time: "6:00 PM EST",
  },
  {
    platform: "twitter",
    format: "text_post",
    content: "97% of patients on biologics are missing copay assistance programs that could bring their cost to $0.\n\nNot a coupon. Not a one-time discount. $0 every fill.\n\nThe programs exist. The paperwork is the barrier. We handle the paperwork.",
    hashtags: ["RheumatoidArthritis", "CopayAssistance"],
    estimated_engagement: "medium",
    best_post_time: "9:00 AM EST",
  },
  {
    platform: "tiktok",
    format: "video_script",
    content: "Hook: \"Your biologic doesn't have to cost $5,000 a year\"\n\n[0-3s] Text overlay: \"$5,000/year → $0/year\"\n[3-8s] \"If you're on Humira, Enbrel, Rinvoq, or Cosentyx, there are programs that bring your cost to zero.\"\n[8-15s] \"Not a coupon that expires. Not a first-fill discount. Zero dollars. Every fill. Every month.\"\n[15-22s] \"Here's how: manufacturers, foundations, and specialty pharmacies each cover a layer of the cost.\"\n[22-28s] \"The problem? You have to know about all three and apply to each one separately.\"\n[28-35s] \"Or you work with a pharmacy that handles all of it for you.\"\n[35-40s] \"Link in bio to check if your medication qualifies.\"",
    hashtags: ["BiologicMedication", "CopayAssistance", "HealthTok", "ChronicIllness", "RA"],
    estimated_engagement: "high",
    best_post_time: "7:00 PM EST",
  },
];

const sampleFAQs: FAQ[] = [
  { question: "Is the $0 copay offer really free?", answer: "Yes. There are no hidden fees, no subscription costs, and no catch. We combine multiple assistance programs to cover your entire out-of-pocket cost. We make our revenue from standard pharmacy margins, not from you.", source: "Community — asked in every subreddit, every week", category: "copay" },
  { question: "How long does it take to transfer my prescription?", answer: "Typically 7-10 days. The main variable is prior authorization processing by your insurance, which usually takes 3-5 business days. We handle everything and send you text updates at every step.", source: "r/rheumatoid — top 3 most-asked question", category: "transfer" },
  { question: "Can I keep my current doctor?", answer: "Absolutely. Transferring your pharmacy does not change your prescriber. Your doctor stays the same. Only where your medication is dispensed changes.", source: "Facebook RA Support Group", category: "transfer" },
  { question: "What if my copay card stops working?", answer: "Insurance changes are the #1 reason copay cards stop working. When this happens, we immediately identify alternative programs — foundation grants, patient assistance programs, or other manufacturer pathways — to keep your cost at $0.", source: "r/PsoriaticArthritis", category: "copay" },
  { question: "Do you cover biosimilars?", answer: "Yes. We cover both brand-name biologics and their biosimilars (like Hadlima, Hyrimoz, Cyltezo for adalimumab). In some cases, biosimilars actually have better copay assistance available.", source: "r/rheumatoid", category: "medication" },
  { question: "How does the symptom tracker work?", answer: "Log your symptoms daily (pain, stiffness, fatigue, affected joints). Our AI analyzes your patterns, detects potential flares early, and generates a structured summary you can share with your doctor before every visit.", source: "Community interest survey", category: "tracker" },
  { question: "Is my health data private?", answer: "Yes. We are HIPAA-compliant and never sell or share your data. Your symptom tracker data is encrypted and only accessible to you. Provider sharing happens only when you explicitly choose to share.", source: "Community — common concern", category: "tracker" },
  { question: "What insurance types do you accept?", answer: "We accept commercial/employer insurance, Medicare, Medicare + Medicaid (dual eligible), and serve uninsured patients through Patient Assistance Programs. The specific $0 copay pathway varies by insurance type, but the result is the same.", source: "All platforms", category: "insurance" },
];

// ---- MODULE FUNCTIONS ----

export function runContentSprint(): {
  articles: ArticleDraft[];
  socialPosts: SocialPost[];
  faqs: FAQ[];
  summary: string;
} {
  return {
    articles: sampleArticles,
    socialPosts: sampleSocialPosts.slice(0, 5),
    faqs: sampleFAQs.slice(0, 3),
    summary: `Content sprint complete: ${sampleArticles.length} article(s), ${5} social posts, ${3} FAQs drafted. All pending review.`,
  };
}

export function generateArticle(topic: TopicIdea): ArticleDraft {
  return sampleArticles[0]; // In production, calls Claude API
}

export function generateSocialPost(platform: string, topic: string): SocialPost {
  return sampleSocialPosts.find(p => p.platform === platform) || sampleSocialPosts[0];
}

export function generateFAQ(question: string): FAQ {
  return sampleFAQs.find(f => f.question.toLowerCase().includes(question.toLowerCase())) || sampleFAQs[0];
}

export function getTopicQueue(): TopicIdea[] {
  return topicQueue;
}

export function getArticleDrafts(): ArticleDraft[] {
  return sampleArticles;
}

export function getSocialPosts(): SocialPost[] {
  return sampleSocialPosts;
}

export function getFAQs(): FAQ[] {
  return sampleFAQs;
}
