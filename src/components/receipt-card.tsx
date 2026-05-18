"use client";

import { Trash2 } from "lucide-react";
import type { SavedReceipt } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { formatRupiah, formatDate } from "@/lib/format";

interface ReceiptCardProps {
  receipt: SavedReceipt;
  onDelete?: (id: string) => void;
  highlight?: boolean;
}

export function ReceiptCard({ receipt, onDelete, highlight }: ReceiptCardProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition dark:bg-slate-900 ${
        highlight
          ? "border-amber-400 ring-2 ring-amber-300/50 dark:border-amber-500"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {receipt.merchant}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {formatDate(receipt.date)} · {receipt.items.length} items
          </p>
        </div>
        <div className="flex items-start gap-2">
          <div className="text-right">
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {formatRupiah(receipt.total)}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400">
              {receipt.confidence} confidence
            </div>
          </div>
          {onDelete ? (
            <button
              type="button"
              aria-label="Delete receipt"
              onClick={() => onDelete(receipt.id)}
              className="rounded-md p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr]">
        {receipt.thumbnailDataUrl ? (
          <div className="bg-slate-50 p-3 dark:bg-slate-950/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receipt.thumbnailDataUrl}
              alt="receipt"
              className="h-40 w-full rounded-lg object-cover sm:h-full"
            />
          </div>
        ) : null}

        <div className="p-4">
          <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {receipt.items.map((item, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-slate-800 dark:text-slate-200">
                    {item.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>×{item.qty}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[item.category]}`}
                    >
                      {CATEGORY_LABELS[item.category]}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-sm text-slate-700 dark:text-slate-300">
                  {formatRupiah(item.price)}
                </span>
              </li>
            ))}
          </ul>

          {receipt.reasoning ? (
            <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                MiMo reasoning
              </div>
              {receipt.reasoning}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
