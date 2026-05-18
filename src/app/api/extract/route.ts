import { NextRequest, NextResponse } from "next/server";
import { extractReceipt, getMimoConfig } from "@/lib/mimo";
import { mockExtract } from "@/lib/mock-extract";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { imageDataUrl } = (await req.json()) as { imageDataUrl?: string };
    if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "imageDataUrl (data: URL) is required" },
        { status: 400 },
      );
    }

    const config = getMimoConfig();
    if (!config.apiKey) {
      // No MiMo key configured — fall back to deterministic mock so the
      // demo / Vercel preview still works without leaking spend.
      const result = mockExtract(imageDataUrl);
      return NextResponse.json({ result, source: "mock" });
    }

    const result = await extractReceipt(imageDataUrl, config);
    return NextResponse.json({ result, source: "mimo" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
