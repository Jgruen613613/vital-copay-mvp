import { NextResponse } from 'next/server';
import { getClients, addClient, updateClient } from '@/lib/ops-mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const vertical = searchParams.get('vertical');

  let clients = getClients();

  if (status) {
    clients = clients.filter(c => c.status === status);
  }
  if (vertical) {
    clients = clients.filter(c => c.vertical === vertical);
  }

  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.company_name || !body.contact_name || !body.contact_email || !body.package_tier || !body.monthly_rate) {
    return NextResponse.json(
      { error: 'company_name, contact_name, contact_email, package_tier, and monthly_rate are required' },
      { status: 400 }
    );
  }

  const client = addClient(body);
  return NextResponse.json(client, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updated = updateClient(body.id, body);
  if (!updated) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
