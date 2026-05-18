/**
 * Mock receipt fallback for demo / when MIMO_API_KEY is not configured.
 *
 * Picks a plausible Indonesian receipt based on a deterministic hash of the
 * uploaded image bytes, so the same image always returns the same struk —
 * useful for predictable demos and screenshots.
 */

import type { ReceiptExtraction } from "./types";

const SAMPLES: ReceiptExtraction[] = [
  {
    merchant: "Indomaret Jl. Pemuda",
    date: "2026-05-15",
    total: 87500,
    currency: "IDR",
    confidence: "high",
    reasoning:
      "Layout matches Indomaret POS receipt (logo header, NPWP footer). Items are pantry staples — categorized as groceries. Sum of line items reconciles to printed total.",
    items: [
      { name: "Indomie Goreng x5", qty: 5, price: 17500, unit_price: 3500, category: "groceries" },
      { name: "Susu UHT 1L", qty: 2, price: 28000, unit_price: 14000, category: "groceries" },
      { name: "Roti Tawar Sari Roti", qty: 1, price: 16500, category: "groceries" },
      { name: "Telur Ayam 1/2 kg", qty: 1, price: 16000, category: "groceries" },
      { name: "Kantong Plastik", qty: 1, price: 200, category: "household" },
      { name: "Pajak", qty: 1, price: 9300, category: "other" },
    ],
  },
  {
    merchant: "Warung Bu Sri",
    date: "2026-05-16",
    total: 45000,
    currency: "IDR",
    confidence: "medium",
    reasoning:
      "Handwritten warung receipt — merchant identified from header. All items are prepared meals, categorized as F&B. Confidence is medium due to partial smudging on the date line.",
    items: [
      { name: "Nasi Padang Rendang", qty: 1, price: 25000, category: "fnb" },
      { name: "Ayam Pop", qty: 1, price: 15000, category: "fnb" },
      { name: "Es Teh Manis", qty: 1, price: 5000, category: "fnb" },
    ],
  },
  {
    merchant: "Pertamina SPBU 31.110.02",
    date: "2026-05-12",
    total: 150000,
    currency: "IDR",
    confidence: "high",
    reasoning:
      "Pertamina SPBU receipt — single line for Pertalite fuel purchase. Quantity in liters but recorded as a single transport expense. Total matches printed amount.",
    items: [
      { name: "Pertalite", qty: 1, price: 150000, category: "transport" },
    ],
  },
  {
    merchant: "GoFood — Kopi Kenangan",
    date: "2026-05-17",
    total: 64000,
    currency: "IDR",
    confidence: "high",
    reasoning:
      "GoFood digital receipt with merchant Kopi Kenangan. Beverage items are F&B. Service fee and delivery fee are separated as 'other' since they're not consumable.",
    items: [
      { name: "Kopi Kenangan Mantan", qty: 2, price: 36000, unit_price: 18000, category: "fnb" },
      { name: "Croffle Original", qty: 1, price: 22000, category: "fnb" },
      { name: "Biaya Layanan", qty: 1, price: 3000, category: "other" },
      { name: "Ongkir", qty: 1, price: 3000, category: "transport" },
    ],
  },
  {
    merchant: "Apotek Kimia Farma",
    date: "2026-05-10",
    total: 134500,
    currency: "IDR",
    confidence: "high",
    reasoning:
      "Kimia Farma branded receipt with prescription serial. Items are over-the-counter medicines and personal care products — top spend category is personal_care.",
    items: [
      { name: "Panadol Extra", qty: 1, price: 28500, category: "personal_care" },
      { name: "Vitamin C 1000mg", qty: 1, price: 45000, category: "personal_care" },
      { name: "Hansaplast Plester", qty: 1, price: 19000, category: "personal_care" },
      { name: "Sabun Cuci Tangan", qty: 1, price: 22000, category: "personal_care" },
      { name: "Tisu Basah", qty: 1, price: 20000, category: "household" },
    ],
  },
  {
    merchant: "Alfamart Sudirman",
    date: "2026-05-14",
    total: 62300,
    currency: "IDR",
    confidence: "high",
    reasoning:
      "Alfamart POS layout. Mix of pantry items and a personal-care item. Largest spend goes to groceries.",
    items: [
      { name: "Beras Premium 5kg", qty: 1, price: 38000, category: "groceries" },
      { name: "Minyak Goreng 1L", qty: 1, price: 17500, category: "groceries" },
      { name: "Pasta Gigi Pepsodent", qty: 1, price: 6800, category: "personal_care" },
    ],
  },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function mockExtract(imageDataUrl: string): ReceiptExtraction {
  const idx = hashString(imageDataUrl) % SAMPLES.length;
  // Return a deep copy so callers can mutate freely
  return JSON.parse(JSON.stringify(SAMPLES[idx]));
}
