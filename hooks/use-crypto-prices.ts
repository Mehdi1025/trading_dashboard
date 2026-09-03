"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 3000;

export function useCryptoPrices(intervalMs = POLL_INTERVAL_MS) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const response = await fetch("/api/crypto/prices", { cache: "no-store" });
        if (!response.ok) {
          if (!cancelled) setConnected(false);
          return;
        }

        const incoming = (await response.json()) as Record<string, number>;
        if (!cancelled) {
          setPrices(incoming);
          setConnected(true);
        }
      } catch {
        if (!cancelled) setConnected(false);
      }
    }

    void poll();
    const intervalId = setInterval(poll, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [intervalMs]);

  return { prices, connected };
}
