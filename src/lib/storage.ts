/**
 * localStorage-backed receipt history. Client-only.
 */

"use client";

import type { SavedReceipt, MonthSummary, ReceiptCategory } from "./types";
import { CATEGORY_LABELS } from "./types";

const STORAGE_KEY = "strukly:receipts:v1";

function read(): SavedReceipt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedReceipt[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: SavedReceipt[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listReceipts(): SavedReceipt[] {
  return read().sort((a, b) =>
    a.uploadedAt < b.uploadedAt ? 1 : -1,
  );
}

export function saveReceipt(receipt: SavedReceipt): void {
  const items = read();
  items.push(receipt);
  write(items);
}

export function deleteReceipt(id: string): void {
  write(read().filter((r) => r.id !== id));
}

export function clearReceipts(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Roll up a month's worth of receipts into a summary the dashboard can
 * render directly. We compute totals/category breakdowns deterministically
 * here and let the UI add a MiMo-generated narrative on top if desired.
 */
export function summarizeMonth(
  receipts: SavedReceipt[],
  monthIso: string,
): MonthSummary {
  const sameMonth = receipts.filter((r) =>
    (r.date ?? r.uploadedAt).startsWith(monthIso),
  );

  const byCategory = {
    groceries: 0,
    fnb: 0,
    transport: 0,
    supplies: 0,
    household: 0,
    personal_care: 0,
    other: 0,
  } as Record<ReceiptCategory, number>;

  const merchantTotals = new Map<string, { total: number; count: number }>();
  let total = 0;

  for (const r of sameMonth) {
    total += r.total;
    for (const item of r.items) {
      byCategory[item.category] = (byCategory[item.category] ?? 0) + item.price;
    }
    const m = merchantTotals.get(r.merchant) ?? { total: 0, count: 0 };
    m.total += r.total;
    m.count += 1;
    merchantTotals.set(r.merchant, m);
  }

  const topMerchants = [...merchantTotals.entries()]
    .map(([merchant, v]) => ({ merchant, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const sortedCats = (Object.entries(byCategory) as [ReceiptCategory, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  const narrative = sortedCats.length === 0
    ? `No receipts yet for ${monthIso}. Upload one to get started.`
    : (() => {
        const [topCat, topVal] = sortedCats[0];
        const pct = Math.round((topVal / total) * 100);
        const merchantHint = topMerchants[0]
          ? ` ${topMerchants[0].merchant} is your most frequent stop with ${topMerchants[0].count} visit${topMerchants[0].count > 1 ? "s" : ""}.`
          : "";
        return `In ${monthIso} you spent Rp ${total.toLocaleString("id-ID")} across ${sameMonth.length} receipt${sameMonth.length > 1 ? "s" : ""}. ${CATEGORY_LABELS[topCat]} leads at ${pct}% of total spend.${merchantHint}`;
      })();

  return {
    month: monthIso,
    total,
    byCategory,
    topMerchants,
    receiptCount: sameMonth.length,
    narrative,
  };
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
