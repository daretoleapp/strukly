/**
 * MiMo VL extraction client.
 *
 * Uses Xiaomi MiMo's OpenAI-compatible vision endpoint to extract structured
 * data + reasoning from a receipt image in a single multimodal call.
 *
 * Set MIMO_API_KEY in .env.local. Optionally override MIMO_BASE_URL and
 * MIMO_MODEL (defaults to mimo-vl-7b on the public OpenRouter mirror, which
 * we use as a free fallback when no MiMo key is configured).
 */

import type { ReceiptExtraction, ReceiptCategory } from "./types";

const SYSTEM_PROMPT = `You are Strukly, a receipt-parsing assistant powered by MiMo VL. \
Given a photo of an Indonesian receipt (struk), extract structured data and \
return STRICT JSON matching this TypeScript shape:

{
  "merchant": string,
  "date": string | null,                  // ISO 8601 if visible, else null
  "total": number,                         // total in IDR, integer rupiah
  "currency": "IDR",
  "items": [
    {
      "name": string,                      // item label as printed
      "qty": number,                       // default 1 if not shown
      "price": number,                     // line total in IDR
      "unit_price": number | null,
      "category": "groceries" | "fnb" | "transport" | "supplies" | "household" | "personal_care" | "other"
    }
  ],
  "reasoning": string,                     // 2-3 sentence chain-of-thought
  "confidence": "high" | "medium" | "low"
}

Rules:
- All money values are integers in rupiah (no decimals, no thousand separators).
- Categorize each item using the categories above. Indonesian receipt cues:
  • "groceries" — Indomaret, Alfamart, supermarket pantry items
  • "fnb" — restaurants, cafés, warung, GoFood/GrabFood, kopi
  • "transport" — Gojek, Grab, Pertamina, parking, toll
  • "supplies" — printing, office supplies, stationery
  • "household" — cleaning, light bulbs, kitchenware
  • "personal_care" — toiletries, cosmetics, pharmacy
  • "other" — anything else
- "reasoning" must briefly explain how you identified the merchant and the
  highest-spend category in plain English (this is shown to the user).
- If text is partially unreadable, still return valid JSON and lower confidence.
- Output ONLY the JSON object, no markdown fences, no commentary.`;

export interface MimoConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function getMimoConfig(): MimoConfig {
  const apiKey = process.env.MIMO_API_KEY ?? "";
  const baseUrl = process.env.MIMO_BASE_URL ?? "https://api.openrouter.ai/v1";
  const model = process.env.MIMO_MODEL ?? "xiaomi/mimo-vl-7b-rl";
  return { apiKey, baseUrl, model };
}

export async function extractReceipt(
  imageDataUrl: string,
  config: MimoConfig = getMimoConfig(),
): Promise<ReceiptExtraction> {
  if (!config.apiKey) {
    throw new Error(
      "MIMO_API_KEY is not configured. Set it in .env.local before calling MiMo.",
    );
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract this Indonesian receipt. Respond with strict JSON only.",
            },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`MiMo API error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const json = await response.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "";
  if (!content) {
    throw new Error("MiMo returned an empty response.");
  }

  const cleaned = content
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  let parsed: ReceiptExtraction;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`MiMo response was not valid JSON: ${cleaned.slice(0, 200)}`);
  }

  // Sanity defaults
  parsed.currency = "IDR";
  parsed.items = (parsed.items ?? []).map((it) => ({
    ...it,
    category: normalizeCategory(it.category),
    qty: typeof it.qty === "number" ? it.qty : 1,
  }));
  if (!parsed.confidence) parsed.confidence = "medium";

  return parsed;
}

function normalizeCategory(value: unknown): ReceiptCategory {
  const allowed: ReceiptCategory[] = [
    "groceries",
    "fnb",
    "transport",
    "supplies",
    "household",
    "personal_care",
    "other",
  ];
  const lower = String(value ?? "").toLowerCase().trim();
  return (allowed as string[]).includes(lower) ? (lower as ReceiptCategory) : "other";
}
