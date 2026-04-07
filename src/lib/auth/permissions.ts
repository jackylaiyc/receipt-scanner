export function isCompanyUser(email: string): boolean {
  const allowed = process.env.COMPANY_ALLOWED_EMAILS
    ?.split(',')
    .map((e) => e.trim().toLowerCase()) ?? [];
  return allowed.includes(email.toLowerCase());
}
