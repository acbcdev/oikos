import { NextRequest, NextResponse } from "next/server";
import { CRYPTO_IDS } from "@/lib/data/crypto-ids";

// TODO: add COINGECKO_API_KEY to .env.local
// Get a free Demo key at https://www.coingecko.com/en/api/pricing
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker")?.toUpperCase();

  if (!ticker) {
    return NextResponse.json({ error: "ticker is required" }, { status: 400 });
  }

  const coinId = CRYPTO_IDS[ticker];
  if (!coinId) {
    return NextResponse.json(
      { error: `Unknown ticker: ${ticker}. Add it to lib/data/crypto-ids.ts` },
      { status: 404 },
    );
  }

  if (!COINGECKO_API_KEY) {
    return NextResponse.json(
      { error: "COINGECKO_API_KEY not set in .env.local" },
      { status: 503 },
    );
  }

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;

  const res = await fetch(url, {
    headers: { "x-cg-demo-api-key": COINGECKO_API_KEY },
    next: { revalidate: 60 }, // cache 60s at the edge
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `CoinGecko error: ${res.status}` },
      { status: 502 },
    );
  }

  const data = await res.json();
  const price: number | undefined = data[coinId]?.usd;

  if (price === undefined) {
    return NextResponse.json(
      { error: "Price not found in CoinGecko response" },
      { status: 502 },
    );
  }

  return NextResponse.json({ price });
}
