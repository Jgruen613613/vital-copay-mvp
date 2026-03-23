import { NextResponse } from 'next/server';
import { getMilestones, updateMilestone } from '@/lib/ops-mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phase = searchParams.get('phase');
  const status = searchParams.get('status');

  let milestones = getMilestones();

  if (phase) {
    milestones = milestones.filter(m => m.phase === parseInt(phase));
  }
  if (status) {
    milestones = milestones.filter(m => m.status === status);
  }

  return NextResponse.json(milestones);
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updated = updateMilestone(body.id, body);
  if (!updated) {
    return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
