import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authInstance';
import { isCompanyUser } from '@/lib/auth/permissions';
import { parseReceiptImage } from '@/lib/gemini/receiptParser';
import type { ParsedReceipt } from '@/types/receipt';

interface BatchItem {
  base64: string;
  mimeType: string;
  filename: string;
  expenseType: 'family' | 'company';
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json() as { images: BatchItem[] };
  const { images } = body;

  if (!images?.length) {
    return NextResponse.json({ error: 'No images provided' }, { status: 400 });
  }

  // Block company batch for non-admins
  const hasCompany = images.some((img) => img.expenseType === 'company');
  if (hasCompany && !isCompanyUser(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const results: Array<{
    filename: string;
    status: 'success' | 'error';
    data?: ParsedReceipt;
    error?: string;
  }> = [];

  for (const item of images) {
    const result = await parseReceiptImage(item.base64, item.mimeType, item.expenseType);
    results.push({
      filename: item.filename,
      status: result.success ? 'success' : 'error',
      data: result.success ? result.data : undefined,
      error: !result.success ? result.error : undefined,
    });

    // Rate limit: 4 seconds between Gemini calls (free tier: 15 RPM)
    if (images.indexOf(item) < images.length - 1) {
      await new Promise((r) => setTimeout(r, 4000));
    }
  }

  return NextResponse.json({ results });
}
