"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Github, FileText, Sparkles, Zap, ArrowRight } from "lucide-react";
import { UploadCard } from "@/components/upload-card";
import { ReceiptCard } from "@/components/receipt-card";
import { Dashboard } from "@/components/dashboard";
import {
  listReceipts,
  deleteReceipt,
  summarizeMonth,
  currentMonth,
} from "@/lib/storage";
import { mockExtract } from "@/lib/mock-extract";
import { uuid } from "@/lib/format";
import type { SavedReceipt } from "@/lib/types";

const SEED_PIXEL_DATAURL =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 280'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%23fef3c7'/><stop offset='100%25' stop-color='%23fde68a'/></linearGradient></defs><rect width='200' height='280' fill='url(%23g)'/><rect x='20' y='30' width='160' height='8' fill='%2392400e' opacity='0.5'/><rect x='20' y='50' width='100' height='6' fill='%2378350f' opacity='0.4'/><g fill='%2378350f' opacity='0.35'><rect x='20' y='80' width='110' height='4'/><rect x='150' y='80' width='30' height='4'/><rect x='20' y='100' width='90' height='4'/><rect x='150' y='100' width='30' height='4'/><rect x='20' y='120' width='130' height='4'/><rect x='150' y='120' width='30' height='4'/><rect x='20' y='140' width='80' height='4'/><rect x='150' y='140' width='30' height='4'/></g><line x1='20' y1='180' x2='180' y2='180' stroke='%2378350f' stroke-dasharray='2 2' opacity='0.4'/><rect x='20' y='200' width='60' height='10' fill='%2378350f' opacity='0.6'/><rect x='130' y='200' width='50' height='10' fill='%2378350f' opacity='0.7'/></svg>";

function makeSeedReceipts(): SavedReceipt[] {
  const now = new Date();
  const month = currentMonth();
  const seeds: SavedReceipt[] = [];
  const seedKeys = ["a", "b", "c", "d", "e", "f"];
  for (let i = 0; i < seedKeys.length; i++) {
    const e = mockExtract(seedKeys[i] + ":seed");
    const d = new Date(now);
    d.setDate(Math.max(1, now.getDate() - i * 2 - 1));
    seeds.push({
      ...e,
      id: `seed-${i}`,
      uploadedAt: d.toISOString(),
      date: e.date ?? d.toISOString().slice(0, 10),
      thumbnailDataUrl: SEED_PIXEL_DATAURL,
    });
  }
  return seeds.map((r) => ({
    ...r,
    date: `${month}-${r.date?.slice(8, 10) ?? "10"}`,
  }));
}

export default function Page() {
  const [receipts, setReceipts] = useState<SavedReceipt[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [source, setSource] = useState<"mimo" | "mock" | null>(null);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    const stored = listReceipts();
    if (stored.length === 0) {
      setReceipts(makeSeedReceipts());
      setSeeded(true);
    } else {
      setReceipts(stored);
    }
  }, []);

  const summary = useMemo(
    () => summarizeMonth(receipts, currentMonth()),
    [receipts],
  );

  function handleResult(receipt: SavedReceipt, src: "mimo" | "mock") {
    setReceipts((prev) => {
      const base = seeded ? [] : prev;
      return [receipt, ...base];
    });
    setSeeded(false);
    setHighlightId(receipt.id);
    setSource(src);
    setTimeout(() => setHighlightId(null), 2500);
  }

  function handleDelete(id: string) {
    if (seeded) return;
    deleteReceipt(id);
    setReceipts(listReceipts());
  }

  return (
    <div className="grain relative min-h-screen overflow-hidden">
      {/* Header */}
      <header className="relative z-10 border-b border-stone-200/60 bg-white/60 backdrop-blur-md dark:border-stone-800/60 dark:bg-stone-950/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <Logo />
            <div>
              <div className="font-serif text-xl font-bold leading-none tracking-tight text-stone-900 dark:text-stone-50">
                Strukly
              </div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-stone-500 dark:text-stone-500">
                receipts × MiMo VL
              </div>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="https://github.com/daretoleapp/strukly"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-full border border-stone-300 bg-white/60 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-stone-400 hover:bg-white sm:flex dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-300 dark:hover:border-stone-600 dark:hover:bg-stone-900"
            >
              <Github className="h-3.5 w-3.5" />
              <span>Source</span>
            </Link>
            <Link
              href="https://github.com/XiaomiMiMo"
              target="_blank"
              className="flex items-center gap-1.5 rounded-full bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-amber-50 shadow-sm transition hover:bg-stone-800 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Built with MiMo</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="blob-amber relative z-10">
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-16 sm:px-8 sm:pt-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-50/80 px-3 py-1 text-[11px] font-medium text-amber-900 backdrop-blur-sm dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
            </span>
            <span className="font-mono uppercase tracking-wider">
              Live · Indonesian receipts
            </span>
          </div>
          <h1 className="max-w-3xl font-serif text-4xl font-bold leading-[1.05] tracking-tight text-stone-900 sm:text-6xl dark:text-stone-50">
            Snap a struk.
            <br />
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 bg-clip-text italic text-transparent">
              See where your money went.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600 dark:text-stone-400">
            Photo of a warung receipt, Indomaret printout, or GoFood digital
            slip — Strukly turns it into structured spending in one shot.
            Powered by Xiaomi MiMo VL&apos;s multimodal reasoning.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3 text-xs">
            <Bullet icon={<Zap className="h-3 w-3" />}>
              One-pass extraction
            </Bullet>
            <Bullet icon={<FileText className="h-3 w-3" />}>
              Auto-categorized
            </Bullet>
            <Bullet icon={<Sparkles className="h-3 w-3" />}>
              Reasoning trace
            </Bullet>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div className="space-y-3">
            <UploadCard onResult={handleResult} />
            {source ? (
              <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white/80 px-3 py-2.5 text-xs shadow-sm backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80">
                <span className="text-stone-600 dark:text-stone-400">
                  Last extraction
                </span>
                <span
                  className={`font-mono font-semibold uppercase tracking-wider ${
                    source === "mimo"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {source === "mimo" ? "● live MiMo" : "○ mock"}
                </span>
              </div>
            ) : null}
          </div>
          <div>
            <Dashboard summary={summary} />
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-500">
                /history
              </div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Recent receipts
              </h2>
            </div>
            {seeded ? (
              <span className="rounded-full border border-amber-300/60 bg-amber-50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-800 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-300">
                demo data
              </span>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {receipts.map((r) => (
              <ReceiptCard
                key={r.id}
                receipt={r}
                onDelete={seeded ? undefined : handleDelete}
                highlight={r.id === highlightId}
              />
            ))}
          </div>
        </section>

        <footer className="mt-20 border-t border-stone-200/70 pt-6 dark:border-stone-800/70">
          <div className="flex flex-col items-start justify-between gap-3 text-xs text-stone-500 sm:flex-row sm:items-center dark:text-stone-500">
            <p>
              Made for{" "}
              <span className="font-semibold text-stone-700 dark:text-stone-300">
                UMKM
              </span>{" "}
              and freelancers in Indonesia who hate manual data entry.
            </p>
            <p className="flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <span>powered by</span>
              <a
                href="https://github.com/XiaomiMiMo"
                target="_blank"
                className="inline-flex items-center gap-1 text-amber-700 transition hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
              >
                Xiaomi MiMo VL <ArrowRight className="h-3 w-3" />
              </a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function Logo() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 opacity-90 shadow-md" />
      <div className="absolute inset-[2px] rounded-[10px] bg-stone-900 dark:bg-stone-950" />
      <svg
        viewBox="0 0 24 24"
        className="relative h-5 w-5 text-amber-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 4 L5 20 L8 18 L11 20 L14 18 L17 20 L19 18 L19 4 L17 6 L14 4 L11 6 L8 4 Z" />
        <line x1="8" y1="9" x2="16" y2="9" />
        <line x1="8" y1="13" x2="14" y2="13" />
      </svg>
    </div>
  );
}

function Bullet({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white/60 px-2.5 py-1 font-medium text-stone-700 backdrop-blur-sm dark:border-stone-800/80 dark:bg-stone-900/40 dark:text-stone-300">
      <span className="text-amber-600 dark:text-amber-400">{icon}</span>
      {children}
    </div>
  );
}
