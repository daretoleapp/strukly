"use client";

import { useState } from "react";
import { Upload, Loader2, Sparkles } from "lucide-react";
import { fileToDataUrl, downscaleDataUrl, uuid } from "@/lib/format";
import type { ReceiptExtraction, SavedReceipt } from "@/lib/types";
import { saveReceipt } from "@/lib/storage";

interface UploadCardProps {
  onResult: (receipt: SavedReceipt, source: "mimo" | "mock") => void;
}

export function UploadCard({ onResult }: UploadCardProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const raw = await fileToDataUrl(file);
      const small = await downscaleDataUrl(raw, 1280, 0.85);
      setPreview(small);

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: small }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);

      const extraction = json.result as ReceiptExtraction;
      const saved: SavedReceipt = {
        ...extraction,
        id: uuid(),
        uploadedAt: new Date().toISOString(),
        thumbnailDataUrl: small,
      };
      saveReceipt(saved);
      onResult(saved, json.source);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Scan a struk
        </h2>
      </div>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        Upload a photo of an Indonesian receipt. MiMo VL extracts items,
        categories, and the highest-spend reasoning in one pass.
      </p>

      <label
        htmlFor="struk-file"
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          busy
            ? "border-slate-300 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
            : "border-slate-300 bg-slate-50 hover:border-amber-500 hover:bg-amber-50/40 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-amber-400 dark:hover:bg-amber-950/30"
        }`}
      >
        {busy ? (
          <>
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-amber-500" />
            <span className="text-sm font-medium">
              MiMo VL is reading your struk…
            </span>
          </>
        ) : (
          <>
            <Upload className="mb-3 h-8 w-8 text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Click or drop a photo
            </span>
            <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              JPG / PNG / WebP up to ~10MB
            </span>
          </>
        )}
        <input
          id="struk-file"
          type="file"
          accept="image/*"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.currentTarget.value = "";
          }}
        />
      </label>

      {preview && busy ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="preview" className="max-h-72 w-full object-contain" />
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700/50 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      ) : null}
    </div>
  );
}
