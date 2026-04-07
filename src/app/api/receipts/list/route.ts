import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authInstance';
import { isCompanyUser } from '@/lib/auth/permissions';
import { getFamilyRows } from '@/lib/sheets/familySheet';
import { getCompanyRows } from '@/lib/sheets/companySheet';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const type = params.get('type') as 'family' | 'company' | null;

  if (type === 'company' && !isCompanyUser(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const filters = {
    category: params.get('category') ?? undefined,
    dateFrom: params.get('dateFrom') ?? undefined,
    dateTo: params.get('dateTo') ?? undefined,
    merchant: params.get('merchant') ?? undefined,
    submittedBy: params.get('submittedBy') ?? undefined,
    page: parseInt(params.get('page') ?? '1', 10),
    limit: parseInt(params.get('limit') ?? '50', 10),
  };

  const receipts = type === 'company'
    ? await getCompanyRows(filters)
    : await getFamilyRows(filters);

  return NextResponse.json({ receipts });
}
