// Type definitions for Strukly
export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;        // total per line item, in IDR
  unit_price?: number;  // price per unit, optional
  category: ReceiptCategory;
}

export type ReceiptCategory =
  | "groceries"
  | "fnb"
  | "transport"
  | "supplies"
  | "household"
  | "personal_care"
  | "other";

export const CATEGORY_LABELS: Record<ReceiptCategory, string> = {
  groceries: "Groceries",
  fnb: "Food & Beverage",
  transport: "Transport",
  supplies: "Office / Supplies",
  household: "Household",
  personal_care: "Personal Care",
  other: "Other",
};

export const CATEGORY_COLORS: Record<ReceiptCategory, string> = {
  groceries: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  fnb: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  transport: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  supplies: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  household: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  personal_care: "bg-pink-500/15 text-pink-700 dark:text-pink-300",
  other: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
};

export interface ReceiptExtraction {
  merchant: string;
  date: string | null;          // ISO 8601 if extractable
  total: number;                 // IDR
  currency: "IDR";
  items: ReceiptItem[];
  reasoning: string;             // MiMo's chain-of-thought summary
  confidence: "high" | "medium" | "low";
}

export interface SavedReceipt extends ReceiptExtraction {
  id: string;
  uploadedAt: string;            // ISO 8601
  thumbnailDataUrl?: string;     // base64 for history view
}

export interface MonthSummary {
  month: string;                 // "2026-05"
  total: number;
  byCategory: Record<ReceiptCategory, number>;
  topMerchants: { merchant: string; total: number; count: number }[];
  receiptCount: number;
  narrative: string;             // MiMo's monthly reasoning
}
