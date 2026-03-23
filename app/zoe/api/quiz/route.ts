import { NextRequest, NextResponse } from 'next/server'
import { supabase, usesMockData } from '@/lib/supabase'
import { addZoeSubmission, updateZoeSubmission, zoeSubmissions } from '@/lib/zoe-mock-data'

// POST — Create quiz submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, fragrance_name, answers, mood_board_notes } = body

    if (!name || !email || !email.includes('@')) {
      return NextResponse.json({ error: 'Name and valid email required' }, { status: 400 })
    }

    if (usesMockData) {
      const submission = addZoeSubmission({ name, email, fragrance_name, answers, mood_board_notes })
      return NextResponse.json(submission, { status: 201 })
    }

    const { data, error } = await supabase!
      .from('zoe_quiz_submissions')
      .insert({
        name,
        email,
        fragrance_name: fragrance_name || null,
        answers: answers || {},
        mood_board_notes: mood_board_notes || [],
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Quiz submission error:', err)
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
  }
}

// GET — List all submissions (for admin)
export async function GET() {
  try {
    if (usesMockData) {
      return NextResponse.json(zoeSubmissions.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ))
    }

    const { data, error } = await supabase!
      .from('zoe_quiz_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('Fetch submissions error:', err)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

// PATCH — Update submission status/notes
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, brief_status, perfumer_notes, generated_brief } = body

    if (!id) {
      return NextResponse.json({ error: 'Submission ID required' }, { status: 400 })
    }

    if (usesMockData) {
      const updated = updateZoeSubmission(id, {
        ...(brief_status && { brief_status }),
        ...(perfumer_notes !== undefined && { perfumer_notes }),
        ...(generated_brief !== undefined && { generated_brief }),
      })
      if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json(updated)
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (brief_status) updates.brief_status = brief_status
    if (perfumer_notes !== undefined) updates.perfumer_notes = perfumer_notes
    if (generated_brief !== undefined) updates.generated_brief = generated_brief

    const { data, error } = await supabase!
      .from('zoe_quiz_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('Update submission error:', err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
