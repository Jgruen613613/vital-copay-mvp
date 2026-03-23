import { NextRequest, NextResponse } from 'next/server'
import { supabase, usesMockData } from '@/lib/supabase'
import { addZoeWaitlistSignup } from '@/lib/zoe-mock-data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    if (usesMockData) {
      const entry = addZoeWaitlistSignup(email)
      return NextResponse.json(entry, { status: 201 })
    }

    const { data, error } = await supabase!
      .from('zoe_waitlist')
      .insert({ email, source: 'landing_page' })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Waitlist signup error:', err)
    return NextResponse.json({ error: 'Failed to sign up' }, { status: 500 })
  }
}
