import { NextResponse } from 'next/server';
import { getLicensingProspects, addLicensingProspect, updateLicensingProspect } from '@/lib/ops-mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stage = searchParams.get('stage');
  const tier = searchParams.get('tier');

  let prospects = getLicensingProspects();

  if (stage) {
    prospects = prospects.filter(p => p.stage === stage);
  }
  if (tier) {
    prospects = prospects.filter(p => p.tierInterest === tier);
  }

  return NextResponse.json(prospects);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.name) {
    return NextResponse.json(
      { error: 'name is required' },
      { status: 400 }
    );
  }

  const prospect = addLicensingProspect(body);
  return NextResponse.json(prospect, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updated = updateLicensingProspect(body.id, body);
  if (!updated) {
    return NextResponse.json({ error: 'Licensing prospect not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
