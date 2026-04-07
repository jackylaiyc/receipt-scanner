import { generateContent } from './client';
import type { ParsedReceipt } from '@/types/receipt';
import { FAMILY_CATEGORIES, COMPANY_CATEGORIES } from '@/constants/categories';

function buildCategoryList(expenseType: 'family' | 'company'): string {
  const cats = expenseType === 'family' ? FAMILY_CATEGORIES : COMPANY_CATEGORIES;
  return cats.map((c) => c.value).join(', ');
}

const PROMPT_TEMPLATE = (categoryList: string) => `
Analyze this receipt image. Extract all data and return as raw JSON only.
Do NOT include markdown, code fences, or any explanation — output raw JSON only.

{
  "merchantName": "string",
  "merchantAddress": "string or null",
  "date": "YYYY-MM-DD format",
  "lineItems": [
    { "description": "string", "quantity": 1, "unitPrice": 0.00, "totalPrice": 0.00 }
  ],
  "subtotal": 0.00,
  "tax": 0.00,
  "tip": null,
  "total": 0.00,
  "currency": "ISO 4217 code e.g. USD",
  "paymentMethod": "string or null",
  "receiptNumber": "string or null",
  "suggestedCategory": "must be exactly one of: ${categoryList}",
  "confidence": 0.95
}

Rules:
- If a field is not visible on the receipt, use null
- Date must be YYYY-MM-DD format
- All amounts must be numbers (not strings)
- suggestedCategory must exactly match one of the provided options
`;

export type ParseReceiptResult =
  | { success: true; data: ParsedReceipt }
  | { success: false; error: string; rawText?: string };

export async function parseReceiptImage(
  base64: string,
  mimeType: string,
  expenseType: 'family' | 'company'
): Promise<{ success: boolean; data?: ParsedReceipt; error?: string; rawText?: string }> {
  const categoryList = buildCategoryList(expenseType);

  try {
    const text = await generateContent([
      { inlineData: { mimeType, data: base64 } },
      { text: PROMPT_TEMPLATE(categoryList) },
    ]);

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

    // Extract JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: 'No JSON found in response', rawText: text };
    }

    const parsed = JSON.parse(jsonMatch[0]) as ParsedReceipt;

    if (!parsed.merchantName || !parsed.total) {
      return { success: false, error: 'Missing required fields', rawText: text };
    }

    parsed.total = parseFloat(String(parsed.total)) || 0;
    parsed.subtotal = parseFloat(String(parsed.subtotal)) || 0;
    parsed.tax = parseFloat(String(parsed.tax)) || 0;
    if (parsed.tip) parsed.tip = parseFloat(String(parsed.tip)) || 0;

    return { success: true, data: parsed };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}
