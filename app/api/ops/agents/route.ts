import { NextResponse } from 'next/server';
import { getAgentRuns, addAgentRun, updateAgentRun } from '@/lib/ops-mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentType = searchParams.get('agent_type');

  let runs = getAgentRuns();

  if (agentType) {
    runs = runs.filter(r => r.agentType === agentType);
  }

  return NextResponse.json(runs);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.agent_type) {
    return NextResponse.json(
      { error: 'agent_type is required' },
      { status: 400 }
    );
  }

  const run = addAgentRun(body);
  return NextResponse.json(run, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updated = updateAgentRun(body.id, body);
  if (!updated) {
    return NextResponse.json({ error: 'Agent run not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
