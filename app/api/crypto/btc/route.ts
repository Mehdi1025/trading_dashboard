import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COINBASE_WS_URL = "wss://ws-feed.exchange.coinbase.com";
const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true";

type BtcTick = {
  price: number;
  change24h: number | null;
  source: "coinbase" | "coingecko";
  timestamp: number;
};

async function fetchCoinGeckoTick(): Promise<BtcTick | null> {
  try {
    const response = await fetch(COINGECKO_URL, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      bitcoin?: { usd?: number; usd_24h_change?: number };
    };

    const price = data.bitcoin?.usd;
    if (typeof price !== "number" || !Number.isFinite(price)) return null;

    return {
      price,
      change24h:
        typeof data.bitcoin?.usd_24h_change === "number"
          ? data.bitcoin.usd_24h_change
          : null,
      source: "coingecko",
      timestamp: Date.now(),
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  let ws: WebSocket | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let fallbackIntervalId: ReturnType<typeof setInterval> | null = null;
  let latestTick: BtcTick | null = null;
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
      const tick = await fetchCoinGeckoTick();
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
            product_ids: ["BTC-USD"],
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

          if (payload.type !== "ticker" || payload.product_id !== "BTC-USD") return;

          const price = Number.parseFloat(payload.price ?? "");
          if (!Number.isFinite(price)) return;

          latestTick = {
            price,
            change24h: latestTick?.change24h ?? null,
            source: "coinbase",
            timestamp: Date.now(),
          };
        } catch {
          // Ignore malformed payloads.
        }
      };

      ws.onerror = () => {
        startFallback();
      };

      ws.onclose = () => {
        startFallback();
      };

      intervalId = setInterval(sendTick, 1000);

      void fetchCoinGeckoTick().then((tick) => {
        if (tick) {
          latestTick = latestTick ?? tick;
          if (latestTick.source === "coinbase" && tick.change24h !== null) {
            latestTick = { ...latestTick, change24h: tick.change24h };
          }
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
