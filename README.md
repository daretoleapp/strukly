# Strukly

> Indonesian receipt scanner powered by **Xiaomi MiMo VL**.

Snap a photo of a struk (Indonesian receipt) and Strukly extracts:

- **Merchant, date, total, line items** — fully structured
- **Auto-categorization** per item (groceries, F&B, transport, supplies, household, personal care)
- **MiMo's reasoning trace** — a short explanation of *why* each call was made
- A **monthly dashboard** that rolls everything up into category breakdown, top merchants, and a natural-language narrative

Built for UMKM owners and freelancers in Indonesia who don't want to type
receipts into spreadsheets.

## Why MiMo VL

Indonesian receipts are a hard target for traditional OCR pipelines:

- Mix of printed and handwritten text (warung, GoFood, Indomaret, SPBU)
- Item names full of brand-specific abbreviations (e.g. *"Indomie Goreng x5"*)
- No standard layout — every merchant invents their own

A two-stage pipeline (OCR → LLM) loses information at every hop. MiMo VL
reads the image and the structure together: it can decide *"this is an
Alfamart receipt, the column on the right is the line total in rupiah,
those line items are pantry staples"* in a single pass. The reasoning trace
is what makes the result useful — users don't just see numbers, they see
the model's explanation of how it got there.

## Stack

- **Next.js 16** + TypeScript + Tailwind CSS 4 (App Router)
- **MiMo VL** (`xiaomi/mimo-vl-7b-rl`) over an OpenAI-compatible chat
  completions API
- **Vercel** for deployment
- **localStorage** for receipt history (no backend persistence — privacy
  by default, this is a single-user demo)

## Local development

```bash
pnpm install
cp .env.example .env.local
# fill in MIMO_API_KEY
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

If `MIMO_API_KEY` is not set, the app falls back to a deterministic mock
extraction so previews and screenshots still work.

## API contract

`POST /api/extract`

```json
{ "imageDataUrl": "data:image/jpeg;base64,…" }
```

Returns:

```json
{
  "result": {
    "merchant": "Indomaret Jl. Pemuda",
    "date": "2026-05-15",
    "total": 87500,
    "currency": "IDR",
    "items": [
      { "name": "Indomie Goreng x5", "qty": 5, "price": 17500, "category": "groceries" }
    ],
    "reasoning": "Layout matches Indomaret POS receipt…",
    "confidence": "high"
  },
  "source": "mimo"
}
```

## Roadmap

- [ ] Push monthly summary back through MiMo for richer narratives
- [ ] Export to CSV / Sheets
- [ ] Multi-user auth + cloud history
- [ ] Bahasa Indonesia UI toggle

## License

MIT.
