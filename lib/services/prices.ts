import type { Position } from "@/lib/data/portfolio";

// --- Stocks & ETFs (Yahoo Finance v8, direct — no CORS issues) ---

interface YahooChartResponse {
  chart: {
    result: Array<{
      meta: { regularMarketPrice: number };
    }> | null;
    error: string | null;
  };
}

export async function fetchStockPrice(ticker: string): Promise<number> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Yahoo Finance error ${res.status} for ${ticker}`);
  }

  const data: YahooChartResponse = await res.json();
  const price = data.chart.result?.[0]?.meta?.regularMarketPrice;

  if (price === undefined) {
    throw new Error(`No price returned for ${ticker}`);
  }

  return price;
}

// --- Crypto (proxied through /api/price/crypto to hide CoinGecko key) ---

export async function fetchCryptoPrice(ticker: string): Promise<number> {
  const res = await fetch(
    `/api/price/crypto?ticker=${encodeURIComponent(ticker)}`,
  );
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? `Crypto price fetch failed for ${ticker}`);
  }

  return data.price as number;
}

// --- Unified refresh — picks the right fetcher based on position type ---

export function hasLivePrice(position: Position): boolean {
  return (
    position.type === "stock" ||
    position.type === "etf" ||
    position.type === "crypto"
  );
}

export async function refreshPositionPrice(
  position: Position,
): Promise<number | null> {
  switch (position.type) {
    case "stock":
    case "etf":
      return fetchStockPrice(position.ticker!);
    case "crypto":
      return fetchCryptoPrice(position.ticker!);
    case "real-estate":
    case "bond":
      // No live price source — manual only
      return null;
  }
}
