import type { NextRequest } from "next/server";
import { getTradingPair, isValidPairId } from "@/lib/crypto-pairs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COINBASE_WS_URL = "wss://ws-feed.exchange.coinbase.com";

type LiveTick = {
  pair: string;
  symbol: string;
  price: number;
  change24h: number | null;
  source: "coinbase" | "coingecko";
  timestamp: number;
};

async function fetchCoinGeckoTick(coingeckoId: string, pairId: string, symbol: string): Promise<LiveTick | null> {
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

export async function GET(request: NextRequest) {
  const pairParam = request.nextUrl.searchParams.get("pair") ?? "BTC-USD";

  if (!isValidPairId(pairParam)) {
    return new Response(JSON.stringify({ error: "Invalid trading pair" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const pair = getTradingPair(pairParam)!;
  const encoder = new TextEncoder();

  let ws: WebSocket | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let fallbackIntervalId: ReturnType<typeof setInterval> | null = null;
  let latestTick: LiveTick | null = null;
  let usingFallback = false;
  let cleanedUp = false;

  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;

    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (fallbackIntervalId !== null) {
      clearInterval(fallbackIntervalId);
      fallbackIntervalId = null;
    }

    if (ws && ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
      ws.close();
    }

    ws = null;
  };

  const startFallback = () => {
    if (usingFallback) return;
    usingFallback = true;

    const poll = async () => {
      const tick = await fetchCoinGeckoTick(pair.coingeckoId, pair.id, pair.symbol);
      if (tick) latestTick = tick;
    };

    void poll();
    fallbackIntervalId = setInterval(poll, 1000);
  };

  const stream = new ReadableStream({
    start(controller) {
      const closeStream = () => {
        cleanup();
        try {
          controller.close();
        } catch {
          // Stream already closed.
        }
      };

      const sendTick = () => {
        if (!latestTick) return;

        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(latestTick)}\n\n`),
          );
        } catch {
          closeStream();
        }
      };

      ws = new WebSocket(COINBASE_WS_URL);

      ws.onopen = () => {
        ws?.send(
          JSON.stringify({
            type: "subscribe",
            product_ids: [pair.coinbaseId],
            channels: ["ticker"],
          }),
        );
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(String(event.data)) as {
            type?: string;
            product_id?: string;
            price?: string;
          };

          if (payload.type !== "ticker" || payload.product_id !== pair.coinbaseId) return;

          const price = Number.parseFloat(payload.price ?? "");
          if (!Number.isFinite(price)) return;

          latestTick = {
            pair: pair.id,
            symbol: pair.symbol,
            price,
            change24h: latestTick?.change24h ?? null,
            source: "coinbase",
            timestamp: Date.now(),
          };
        } catch {
          // Ignore malformed payloads.
        }
      };

      ws.onerror = () => startFallback();
      ws.onclose = () => startFallback();

      intervalId = setInterval(sendTick, 1000);

      void fetchCoinGeckoTick(pair.coingeckoId, pair.id, pair.symbol).then((tick) => {
        if (!tick) return;
        latestTick = latestTick ?? tick;
        if (latestTick.source === "coinbase" && tick.change24h !== null) {
          latestTick = { ...latestTick, change24h: tick.change24h };
        }
      });

      request.signal.addEventListener("abort", closeStream, { once: true });
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
