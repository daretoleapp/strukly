"use client";

import type { MonthSummary } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { Receipt, TrendingUp, Store } from "lucide-react";

interface DashboardProps {
  summary: MonthSummary;
}

export function Dashboard({ summary }: DashboardProps) {
  const sortedCategories = Object.entries(summary.byCategory)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  const total = summary.total;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          icon={<TrendingUp className="h-5 w-5 text-amber-500" />}
          label="Total this month"
          value={formatRupiah(summary.total)}
        />
        <KpiCard
          icon={<Receipt className="h-5 w-5 text-sky-500" />}
          label="Receipts"
          value={String(summary.receiptCount)}
        />
        <KpiCard
          icon={<Store className="h-5 w-5 text-emerald-500" />}
          label="Top merchant"
          value={summary.topMerchants[0]?.merchant ?? "—"}
          sub={
            summary.topMerchants[0]
              ? `${summary.topMerchants[0].count} visit${summary.topMerchants[0].count > 1 ? "s" : ""}`
              : undefined
          }
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Spending by category · {summary.month}
          </h3>
        </div>
        {sortedCategories.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No receipts in this month yet.
          </p>
        ) : (
          <div className="space-y-2.5">
            {sortedCategories.map(([cat, value]) => {
              const pct = total > 0 ? (value / total) * 100 : 0;
              const colorClass = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS];
              return (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span
                      className={`rounded px-1.5 py-0.5 font-medium ${colorClass}`}
                    >
                      {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {formatRupiah(value)} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-amber-300/60 bg-gradient-to-br from-amber-50 to-amber-100/60 p-5 shadow-sm dark:border-amber-700/40 dark:from-amber-950/40 dark:to-amber-900/20">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">
            MiMo summary
          </span>
        </div>
        <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-100">
          {summary.narrative}
        </p>
      </div>

      {summary.topMerchants.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Top merchants
          </h3>
          <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {summary.topMerchants.map((m) => (
              <li
                key={m.merchant}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {m.merchant}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {m.count} receipt{m.count > 1 ? "s" : ""}
                  </div>
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {formatRupiah(m.total)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        {icon}
        <span className="font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
      {sub ? (
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {sub}
        </div>
      ) : null}
    </div>
  );
}
