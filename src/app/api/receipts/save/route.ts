import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authInstance';
import { isCompanyUser } from '@/lib/auth/permissions';
import { uploadReceiptImage } from '@/lib/drive/imageUpload';
import { appendFamilyRow } from '@/lib/sheets/familySheet';
import { appendCompanyRow } from '@/lib/sheets/companySheet';
import { convertToUSD } from '@/lib/currency/converter';
import type { Receipt } from '@/types/receipt';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json() as { receipt: Receipt; imageBase64?: string; imageMimeType?: string };
  const { receipt, imageBase64, imageMimeType } = body;

  if (receipt.expenseType === 'company' && !isCompanyUser(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Assign ID and metadata
  receipt.id = uuidv4();
  receipt.submittedBy = session.user.email;
  receipt.createdAt = new Date().toISOString();

  // Upload image to Drive
  if (imageBase64 && imageMimeType) {
    try {
      const filename = `receipt_${receipt.id}_${Date.now()}.jpg`;
      receipt.imageUrl = await uploadReceiptImage(imageBase64, imageMimeType, filename);
    } catch (err) {
      console.error('Drive upload failed:', err);
    }
  }

  // Convert currency
  if (receipt.currency && receipt.currency !== 'USD') {
    receipt.amountUSD = await convertToUSD(receipt.total, receipt.currency);
  } else {
    receipt.amountUSD = receipt.total;
  }

  // Save to appropriate sheet
  const rowIndex = receipt.expenseType === 'family'
    ? await appendFamilyRow(receipt)
    : await appendCompanyRow(receipt);

  return NextResponse.json({ success: true, receiptId: receipt.id, rowIndex });
}
