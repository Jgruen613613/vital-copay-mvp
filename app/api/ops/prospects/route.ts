import { NextResponse } from 'next/server';
import { getProspects, addProspect, updateProspect } from '@/lib/ops-mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vertical = searchParams.get('vertical');
  const status = searchParams.get('status');
  const minIntent = searchParams.get('min_intent');

  let prospects = getProspects();

  if (vertical) {
    prospects = prospects.filter(p => p.vertical === vertical);
  }
  if (status) {
    prospects = prospects.filter(p => p.stage === status);
  }
  if (minIntent) {
    prospects = prospects.filter(p => p.switchingIntentScore >= parseInt(minIntent));
  }

  return NextResponse.json(prospects);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.company_name || !body.signal_type) {
    return NextResponse.json(
      { error: 'company_name and signal_type are required' },
      { status: 400 }
    );
  }

  const prospect = addProspect(body);
  return NextResponse.json(prospect, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updated = updateProspect(body.id, body);
  if (!updated) {
    return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
