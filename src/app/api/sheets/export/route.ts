import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authInstance';
import { isCompanyUser } from '@/lib/auth/permissions';
import { getAllFamilyRows } from '@/lib/sheets/familySheet';
import { getAllCompanyRows } from '@/lib/sheets/companySheet';
import type { Receipt } from '@/types/receipt';

function toCSV(receipts: Receipt[], type: 'family' | 'company'): string {
  const familyHeaders = ['ID','Date','Merchant','Category','Total','Currency','Amount USD','Tax','Tip','Payment','Paid By','Split With','Notes','Image URL','Submitted By','Created At'];
  const companyHeaders = ['ID','Date','Merchant','Category','Department','Project Code','Business Purpose','Total','Currency','Amount USD','Tax','Payment','Reimbursable','Tax Deductible','Receipt #','Image URL','Submitted By','Created At'];
  const headers = type === 'family' ? familyHeaders : companyHeaders;

  const escape = (v: string | number | boolean | null | undefined) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const rows = receipts.map((r) => {
    if (type === 'family') {
      return [r.id, r.date, r.merchantName, r.category, r.total, r.currency, r.amountUSD, r.tax, r.tip, r.paymentMethod, r.paidBy, r.splitWith, r.notes, r.imageUrl, r.submittedBy, r.createdAt].map(escape).join(',');
    } else {
      return [r.id, r.date, r.merchantName, r.category, r.department, r.projectCode, r.businessPurpose, r.total, r.currency, r.amountUSD, r.tax, r.paymentMethod, r.isReimbursable, r.taxDeductible, r.receiptNumber, r.imageUrl, r.submittedBy, r.createdAt].map(escape).join(',');
    }
  });

  return [headers.join(','), ...rows].join('\n');
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const type = (params.get('type') ?? 'family') as 'family' | 'company';
  const month = params.get('month'); // YYYY-MM

  if (type === 'company' && !isCompanyUser(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let receipts = type === 'family' ? await getAllFamilyRows() : await getAllCompanyRows();
  if (month) {
    receipts = receipts.filter((r) => r.date.startsWith(month));
  }

  const csv = toCSV(receipts, type);
  const filename = `${type}-expenses${month ? `-${month}` : ''}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
