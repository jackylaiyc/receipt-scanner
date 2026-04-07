import { auth } from '@/lib/auth/authInstance';
import { isCompanyUser } from '@/lib/auth/permissions';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ canAccessCompany: false });
  }
  return NextResponse.json({
    canAccessCompany: isCompanyUser(session.user.email),
  });
}
