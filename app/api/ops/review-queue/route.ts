import { NextResponse } from 'next/server';
import { getReviewQueue, updateReviewItem } from '@/lib/ops-mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const itemType = searchParams.get('item_type');

  let items = getReviewQueue();

  if (status) {
    items = items.filter(i => i.status === status);
  }
  if (itemType) {
    items = items.filter(i => i.type === itemType);
  }

  return NextResponse.json(items);
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (!body.id || !body.status) {
    return NextResponse.json(
      { error: 'id and status are required' },
      { status: 400 }
    );
  }

  const updated = updateReviewItem(body.id, body);
  if (!updated) {
    return NextResponse.json({ error: 'Review item not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
