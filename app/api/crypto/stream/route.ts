import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws/!miniTicker@arr";

type MiniTicker = {
  s: string;
  c: string;
};

function toPriceMap(tickers: MiniTicker[]): Record<string, number> {
  const prices: Record<string, number> = {};

  for (const ticker of tickers) {
    const price = Number.parseFloat(ticker.c);
    if (ticker.s && Number.isFinite(price)) {
      prices[ticker.s] = price;
    }
  }

  return prices;
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  let ws: WebSocket | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let latestPrices: Record<string, number> = {};
  let cleanedUp = false;

  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;

    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (ws && ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
      ws.close();
    }

    ws = null;
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

      const sendPrices = () => {
        if (Object.keys(latestPrices).length === 0) return;

        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(latestPrices)}\n\n`),
          );
        } catch {
          closeStream();
        }
      };

      ws = new WebSocket(BINANCE_WS_URL);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(String(event.data)) as MiniTicker[];
          if (Array.isArray(payload)) {
            latestPrices = toPriceMap(payload);
          }
        } catch {
          // Ignore malformed Binance payloads.
        }
      };

      ws.onerror = closeStream;
      ws.onclose = closeStream;

      intervalId = setInterval(sendPrices, 1000);

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
