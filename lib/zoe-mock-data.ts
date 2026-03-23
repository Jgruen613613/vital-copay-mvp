// Zoe Fragrance — Mock data for local development without Supabase

export interface ZoeSubmission {
  id: number
  name: string
  email: string
  fragrance_name: string | null
  answers: Record<string, unknown>
  mood_board_notes: string[]
  generated_brief: string | null
  brief_status: string
  perfumer_notes: string | null
  created_at: string
  updated_at: string
}

export interface ZoeFeedback {
  id: number
  submission_id: number
  formula_01_ratings: Record<string, unknown>
  formula_02_ratings: Record<string, unknown>
  formula_03_ratings: Record<string, unknown>
  adjustment_request: string | null
  wants_full_bottle: boolean
  preferred_formula: number | null
  created_at: string
}

const globalStore = globalThis as unknown as {
  _zoeSubmissions?: ZoeSubmission[]
  _zoeFeedback?: ZoeFeedback[]
  _zoeWaitlist?: Array<{ id: number; email: string; source: string; created_at: string }>
}

if (!globalStore._zoeSubmissions) globalStore._zoeSubmissions = []
if (!globalStore._zoeFeedback) globalStore._zoeFeedback = []
if (!globalStore._zoeWaitlist) globalStore._zoeWaitlist = []

export const zoeSubmissions = globalStore._zoeSubmissions
export const zoeFeedback = globalStore._zoeFeedback
export const zoeWaitlist = globalStore._zoeWaitlist

export function addZoeSubmission(data: {
  name: string
  email: string
  fragrance_name: string | null
  answers: Record<string, unknown>
  mood_board_notes?: string[]
}): ZoeSubmission {
  const submission: ZoeSubmission = {
    id: zoeSubmissions.length + 1,
    name: data.name,
    email: data.email,
    fragrance_name: data.fragrance_name,
    answers: data.answers,
    mood_board_notes: data.mood_board_notes || [],
    generated_brief: null,
    brief_status: 'pending',
    perfumer_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  zoeSubmissions.push(submission)
  return submission
}

export function updateZoeSubmission(id: number, updates: Partial<ZoeSubmission>): ZoeSubmission | null {
  const idx = zoeSubmissions.findIndex(s => s.id === id)
  if (idx === -1) return null
  zoeSubmissions[idx] = { ...zoeSubmissions[idx], ...updates, updated_at: new Date().toISOString() }
  return zoeSubmissions[idx]
}

export function addZoeFeedback(data: {
  submission_id: number
  formula_01_ratings: Record<string, unknown>
  formula_02_ratings: Record<string, unknown>
  formula_03_ratings: Record<string, unknown>
  adjustment_request: string | null
  wants_full_bottle: boolean
  preferred_formula: number | null
}): ZoeFeedback {
  const feedback: ZoeFeedback = {
    id: zoeFeedback.length + 1,
    ...data,
    created_at: new Date().toISOString(),
  }
  zoeFeedback.push(feedback)
  return feedback
}

export function addZoeWaitlistSignup(email: string, source = 'landing_page') {
  const entry = {
    id: zoeWaitlist.length + 1,
    email,
    source,
    created_at: new Date().toISOString(),
  }
  zoeWaitlist.push(entry)
  return entry
}
