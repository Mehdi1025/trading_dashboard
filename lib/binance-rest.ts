const BINANCE_DATA_API = "https://data-api.binance.vision/api/v3";

export type LiveTickPayload = {
  pair: string;
  symbol: string;
  price: number;
  change24h: number | null;
  source: "binance" | "coingecko";
  timestamp: number;
};

export async function fetchBinancePrices(): Promise<Record<string, number>> {
  const response = await fetch(`${BINANCE_DATA_API}/ticker/price`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Binance API error: ${response.status}`);
  }

  const tickers = (await response.json()) as Array<{ symbol: string; price: string }>;
  const prices: Record<string, number> = {};

  for (const ticker of tickers) {
    const price = Number.parseFloat(ticker.price);
    if (ticker.symbol && Number.isFinite(price)) {
      prices[ticker.symbol] = price;
    }
  }

  return prices;
}

export async function fetchBinanceTick(
  binanceSymbol: string,
  pairId: string,
  symbol: string,
): Promise<LiveTickPayload | null> {
  const response = await fetch(
    `${BINANCE_DATA_API}/ticker/24hr?symbol=${encodeURIComponent(binanceSymbol)}`,
    { cache: "no-store", headers: { Accept: "application/json" } },
  );

  if (!response.ok) return null;

  const data = (await response.json()) as {
    lastPrice?: string;
    priceChangePercent?: string;
  };

  const price = Number.parseFloat(data.lastPrice ?? "");
  if (!Number.isFinite(price)) return null;

  const change = Number.parseFloat(data.priceChangePercent ?? "");

  return {
    pair: pairId,
    symbol,
    price,
    change24h: Number.isFinite(change) ? change : null,
    source: "binance",
    timestamp: Date.now(),
  };
}

export async function fetchCoinGeckoTick(
  coingeckoId: string,
  pairId: string,
  symbol: string,
): Promise<LiveTickPayload | null> {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd&include_24hr_change=true`;
    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as Record<
      string,
      { usd?: number; usd_24h_change?: number }
    >;

    const coin = data[coingeckoId];
    const price = coin?.usd;
    if (typeof price !== "number" || !Number.isFinite(price)) return null;

    return {
      pair: pairId,
      symbol,
      price,
      change24h: typeof coin.usd_24h_change === "number" ? coin.usd_24h_change : null,
      source: "coingecko",
      timestamp: Date.now(),
    };
  } catch {
    return null;
  }
}

export function toBinanceSymbol(symbol: string): string {
  return `${symbol.toUpperCase()}USDT`;
}
