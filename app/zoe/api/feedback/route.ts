import { NextRequest, NextResponse } from 'next/server'
import { supabase, usesMockData } from '@/lib/supabase'
import { addZoeFeedback } from '@/lib/zoe-mock-data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      submission_id,
      formula_01_ratings,
      formula_02_ratings,
      formula_03_ratings,
      adjustment_request,
      wants_full_bottle,
      preferred_formula,
    } = body

    if (!submission_id) {
      return NextResponse.json({ error: 'Submission ID required' }, { status: 400 })
    }

    if (usesMockData) {
      const feedback = addZoeFeedback({
        submission_id,
        formula_01_ratings: formula_01_ratings || {},
        formula_02_ratings: formula_02_ratings || {},
        formula_03_ratings: formula_03_ratings || {},
        adjustment_request: adjustment_request || null,
        wants_full_bottle: wants_full_bottle || false,
        preferred_formula: preferred_formula || null,
      })
      return NextResponse.json(feedback, { status: 201 })
    }

    const { data, error } = await supabase!
      .from('zoe_feedback')
      .insert({
        submission_id,
        formula_01_ratings: formula_01_ratings || {},
        formula_02_ratings: formula_02_ratings || {},
        formula_03_ratings: formula_03_ratings || {},
        adjustment_request: adjustment_request || null,
        wants_full_bottle: wants_full_bottle || false,
        preferred_formula: preferred_formula || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Feedback submission error:', err)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }
}
