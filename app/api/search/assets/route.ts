import { NextRequest, NextResponse } from "next/server";

interface YahooQuote {
  symbol: string;
  shortname?: string;
  longname?: string;
  quoteType: string;
  exchange?: string;
}

interface YahooChartMeta {
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  previousClose?: number;
}

export interface AssetSearchResult {
  ticker: string;
  name: string;
  type: "stock" | "etf" | "crypto";
  exchange: string;
  price?: number;
  changePercent?: number;
}

const QUOTE_TYPE_MAP: Record<string, AssetSearchResult["type"]> = {
  EQUITY: "stock",
  ETF: "etf",
  CRYPTOCURRENCY: "crypto",
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&lang=en-US&region=US&quotesCount=10&newsCount=0&enableFuzzyQuery=false&enableCb=false`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await res.json();
    const quotes: YahooQuote[] = data.quotes ?? [];

    const filtered = quotes
      .filter((q) => QUOTE_TYPE_MAP[q.quoteType] !== undefined)
      .slice(0, 8);

    const priceMap = new Map<string, { price: number; changePercent: number }>();
    await Promise.allSettled(
      filtered.map(async (q) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(q.symbol)}?interval=1d&range=1d`;
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0" },
          next: { revalidate: 30 },
        });
        if (!res.ok) return;
        const data = await res.json();
        const meta = data.chart?.result?.[0]?.meta as YahooChartMeta | undefined;
        if (meta?.regularMarketPrice !== undefined) {
          const prev = meta.chartPreviousClose ?? meta.previousClose;
          const changePercent =
            prev && prev !== 0
              ? ((meta.regularMarketPrice - prev) / prev) * 100
              : undefined;
          priceMap.set(q.symbol, {
            price: meta.regularMarketPrice,
            changePercent: changePercent ?? 0,
          });
        }
      }),
    );

    const results: AssetSearchResult[] = filtered.map((q) => {
      const p = priceMap.get(q.symbol);
      return {
        ticker: q.symbol,
        name: q.shortname ?? q.longname ?? q.symbol,
        type: QUOTE_TYPE_MAP[q.quoteType],
        exchange: q.exchange ?? "",
        ...(p && { price: p.price, changePercent: p.changePercent }),
      };
    });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
