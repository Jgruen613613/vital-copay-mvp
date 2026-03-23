import { NextResponse } from 'next/server';
import { getKnowledgeBase, addKBEntry } from '@/lib/ops-mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vertical = searchParams.get('vertical');
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  let entries = getKnowledgeBase();

  if (vertical) {
    entries = entries.filter(e => e.vertical === vertical);
  }
  if (category) {
    entries = entries.filter(e => e.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    entries = entries.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      (e.tags as string[]).some(t => t.toLowerCase().includes(q))
    );
  }

  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.vertical || !body.category || !body.title || !body.summary) {
    return NextResponse.json(
      { error: 'vertical, category, title, and summary are required' },
      { status: 400 }
    );
  }

  const entry = addKBEntry(body);
  return NextResponse.json(entry, { status: 201 });
}
