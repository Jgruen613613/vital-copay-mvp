import { NextResponse } from 'next/server';
import { getRevenueEntries, addRevenueEntry } from '@/lib/ops-mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source');
  const fromDate = searchParams.get('from');
  const toDate = searchParams.get('to');

  let entries = getRevenueEntries();

  if (source) {
    entries = entries.filter(e => e.source === source);
  }
  if (fromDate) {
    entries = entries.filter(e => e.date >= fromDate);
  }
  if (toDate) {
    entries = entries.filter(e => e.date <= toDate);
  }

  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.date || !body.source || body.amount === undefined) {
    return NextResponse.json(
      { error: 'date, source, and amount are required' },
      { status: 400 }
    );
  }

  const entry = addRevenueEntry(body);
  return NextResponse.json(entry, { status: 201 });
}
