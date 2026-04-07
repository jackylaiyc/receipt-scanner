import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authInstance';
import { parseReceiptImage } from '@/lib/gemini/receiptParser';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json() as { image: string; mimeType: string; expenseType: 'family' | 'company' };
  const { image, mimeType, expenseType } = body;

  if (!image || !mimeType || !expenseType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const result = await parseReceiptImage(image, mimeType, expenseType);
  return NextResponse.json(result);
}
