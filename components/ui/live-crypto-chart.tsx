"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Check,
  ChevronDown,
  Radio,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  DEFAULT_PAIR_ID,
  TRADING_PAIRS,
  type TradingPair,
  getTradingPair,
} from "@/lib/crypto-pairs";
import { cn } from "@/lib/utils";

type LiveTick = {
  pair: string;
  symbol: string;
  price: number;
  change24h: number | null;
  source: "coinbase" | "coingecko";
  timestamp: number;
};

type ChartPoint = {
  time: string;
  price: number;
  timestamp: number;
};

const MAX_POINTS = 90;
const QUICK_PAIRS = ["BTC-USD", "ETH-USD", "SOL-USD", "XRP-USD", "DOGE-USD", "LINK-USD"];

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

function formatPrice(value: number) {
  if (value >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  if (value >= 1) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(value);
}

function formatAxisPrice(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(4)}`;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: ChartPoint }>;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-lg border border-border/80 bg-background/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-xs text-muted-foreground">{point.time}</p>
      <p className="text-sm font-semibold">{formatPrice(point.price)}</p>
    </div>
  );
}

function PairIcon({ pair, size = "md" }: { pair: TradingPair; size?: "sm" | "md" }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm",
        size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs",
      )}
      style={{ backgroundColor: pair.color }}
    >
      {pair.symbol.slice(0, 3)}
    </div>
  );
}

function PairSelector({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = getTradingPair(selectedId) ?? getTradingPair(DEFAULT_PAIR_ID)!;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TRADING_PAIRS;
    return TRADING_PAIRS.filter(
      (pair) =>
        pair.symbol.toLowerCase().includes(q) ||
        pair.name.toLowerCase().includes(q) ||
        pair.id.toLowerCase().includes(q),
    );
  }, [query]);

  const majors = filtered.filter((p) => p.category === "major");
  const alts = filtered.filter((p) => p.category === "alt");

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const renderGroup = (title: string, pairs: TradingPair[]) => {
    if (pairs.length === 0) return null;

    return (
      <div className="py-1">
        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        {pairs.map((pair) => (
          <button
            key={pair.id}
            type="button"
            onClick={() => {
              onSelect(pair.id);
              setOpen(false);
              setQuery("");
            }}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
              selectedId === pair.id && "bg-muted/40",
            )}
          >
            <PairIcon pair={pair} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{pair.name}</p>
              <p className="truncate text-xs text-muted-foreground">{pair.id}</p>
            </div>
            {selectedId === pair.id && <Check className="h-4 w-4 shrink-0 text-emerald-400" />}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-3 rounded-xl border border-border/60 bg-background/80 px-3 py-2 shadow-sm transition-all hover:border-border hover:bg-muted/30",
          open && "border-emerald-500/40 ring-2 ring-emerald-500/20",
        )}
      >
        <PairIcon pair={selected} />
        <div className="text-left">
          <p className="text-sm font-semibold leading-none">{selected.symbol}/USD</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{selected.name}</p>
        </div>
        <ChevronDown
          className={cn("ml-2 h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[min(100vw-2rem,320px)] overflow-hidden rounded-xl border border-border/80 bg-background/95 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-border/60 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher une paire..."
                className="h-10 w-full rounded-lg border border-border/60 bg-muted/30 pl-9 pr-3 text-sm outline-none ring-emerald-500/30 placeholder:text-muted-foreground focus:ring-2"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">Aucune paire trouvée</p>
            ) : (
              <>
                {renderGroup("Majors", majors)}
                {renderGroup("Altcoins", alts)}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function LiveCryptoChart({
  className,
  defaultPairId = DEFAULT_PAIR_ID,
  binancePrices,
  embedded = false,
}: {
  className?: string;
  defaultPairId?: string;
  binancePrices?: Record<string, number>;
  embedded?: boolean;
}) {
  const [selectedPairId, setSelectedPairId] = useState(defaultPairId);
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [latest, setLatest] = useState<LiveTick | null>(null);
  const [connected, setConnected] = useState(false);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const previousPrice = useRef<number | null>(null);

  const selectedPair = getTradingPair(selectedPairId) ?? getTradingPair(DEFAULT_PAIR_ID)!;
  const gradientId = `area-gradient-${selectedPair.symbol}`;

  useEffect(() => {
    setPoints([]);
    setLatest(null);
    previousPrice.current = null;
    setConnected(false);

    const eventSource = new EventSource(`/api/crypto/live?pair=${encodeURIComponent(selectedPairId)}`);

    eventSource.onopen = () => setConnected(true);
    eventSource.onmessage = (event) => {
      try {
        const tick = JSON.parse(event.data) as LiveTick;
        if (tick.pair !== selectedPairId) return;

        setLatest(tick);
        setConnected(true);

        if (previousPrice.current !== null) {
          if (tick.price > previousPrice.current) setFlash("up");
          else if (tick.price < previousPrice.current) setFlash("down");
        }
        previousPrice.current = tick.price;

        setPoints((current) => {
          const next: ChartPoint = {
            time: formatTime(tick.timestamp),
            price: tick.price,
            timestamp: tick.timestamp,
          };
          const merged = [...current, next];
          return merged.length > MAX_POINTS ? merged.slice(-MAX_POINTS) : merged;
        });
      } catch {
        // Ignore malformed payloads.
      }
    };

    eventSource.onerror = () => setConnected(false);

    return () => eventSource.close();
  }, [selectedPairId]);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(timer);
  }, [flash]);

  const minPrice = useMemo(() => {
    if (points.length === 0) return 0;
    return Math.min(...points.map((p) => p.price)) * 0.9995;
  }, [points]);

  const maxPrice = useMemo(() => {
    if (points.length === 0) return 0;
    return Math.max(...points.map((p) => p.price)) * 1.0005;
  }, [points]);

  const changePositive = (latest?.change24h ?? 0) >= 0;

  return (
    <div
      className={cn(
        "overflow-hidden",
        embedded ? "bg-transparent" : "rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-background",
        className,
      )}
    >
      <div
        className={cn(
          embedded ? "pb-3" : "border-b border-border/60 bg-gradient-to-r px-5 py-4 md:px-6",
          !embedded && selectedPair.gradient,
        )}
      >
        {embedded ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PairSelector selectedId={selectedPairId} onSelect={setSelectedPairId} />
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                  connected
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-400",
                )}
              >
                <Radio className={cn("h-3 w-3", connected && "animate-pulse")} />
                {connected ? "Live" : "..."}
              </span>
              {latest && (
                <span className="text-xs text-muted-foreground">
                  {latest.source === "coinbase" ? "Coinbase" : "CoinGecko"}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <h3 className="text-lg font-semibold tracking-tight">Graphique Real-Time</h3>
              </div>
              <p className="max-w-xl text-sm text-muted-foreground">
                Choisissez une paire USD. Mise à jour chaque seconde via Coinbase, fallback CoinGecko.
              </p>
              <PairSelector selectedId={selectedPairId} onSelect={setSelectedPairId} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                  connected
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-400",
                )}
              >
                <Radio className={cn("h-3 w-3", connected && "animate-pulse")} />
                {connected ? "Live" : "Connexion..."}
              </span>
              {latest && (
                <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                  {latest.source === "coinbase" ? "Coinbase" : "CoinGecko"}
                </span>
              )}
            </div>
          </div>
        )}

        <div className={cn("flex flex-wrap gap-2", embedded ? "mt-3" : "mt-4")}>
          {QUICK_PAIRS.map((id) => {
            const pair = getTradingPair(id);
            if (!pair) return null;
            const isActive = selectedPairId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedPairId(id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  isActive
                    ? "border-transparent text-white shadow-md"
                    : "border-border/60 bg-background/50 text-muted-foreground hover:border-border hover:text-foreground",
                )}
                style={
                  isActive
                    ? { backgroundColor: pair.color }
                    : undefined
                }
              >
                {pair.symbol}/USD
              </button>
            );
          })}
        </div>

        <div className={cn("flex flex-wrap items-end gap-4", embedded ? "mt-3" : "mt-5")}>
          <div>
            {!embedded && (
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {selectedPair.symbol}/USD · Prix actuel
              </p>
            )}
            <p
              className={cn(
                "font-bold tracking-tighter transition-colors",
                embedded ? "text-3xl md:text-4xl" : "mt-1 text-4xl md:text-5xl",
                flash === "up" && "text-emerald-400",
                flash === "down" && "text-red-400",
              )}
            >
              {latest ? formatPrice(latest.price) : "—"}
            </p>
          </div>

          {latest?.change24h !== null && latest?.change24h !== undefined && (
            <div
              className={cn(
                "mb-1 flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold",
                changePositive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400",
              )}
            >
              {changePositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {changePositive ? "+" : ""}
              {latest.change24h.toFixed(2)}% (24h)
            </div>
          )}
        </div>
      </div>

      <div className={cn("relative w-full", embedded ? "h-[360px] md:h-[420px]" : "h-[320px] px-2 pb-4 pt-2 md:h-[400px]")}>
        {points.length < 2 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div
                className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-muted"
                style={{ borderTopColor: selectedPair.color }}
              />
              <p className="text-sm text-muted-foreground">
                Chargement du flux {selectedPair.symbol}/USD...
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={selectedPair.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={selectedPair.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(240 3.7% 15.9%)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: "hsl(240 5% 64.9%)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={32}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tick={{ fill: "hsl(240 5% 64.9%)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={72}
                tickFormatter={formatAxisPrice}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={selectedPair.color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: selectedPair.color,
                  stroke: "hsl(240 10% 3.9%)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </div>

      {binancePrices && !embedded && (
        <div className="grid gap-2 border-t border-border/60 px-5 py-3 sm:grid-cols-3 md:px-6">
          {QUICK_PAIRS.slice(0, 3).map((id) => {
            const pair = getTradingPair(id);
            if (!pair) return null;
            const binancePrice =
              binancePrices[`${pair.symbol}USDT`] ??
              binancePrices[pair.symbol] ??
              binancePrices[`${pair.symbol}USD`];
            return (
              <div
                key={id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <PairIcon pair={pair} size="sm" />
                  <span className="text-xs text-muted-foreground">{pair.symbol} · Binance</span>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {binancePrice !== undefined ? formatPrice(binancePrice) : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground",
          embedded ? "pt-2" : "border-t border-border/60 px-5 py-3 md:px-6",
        )}
      >
        <span>
          {points.length} pts · {selectedPair.symbol}/USD
        </span>
        <span>{latest ? formatTime(latest.timestamp) : "—"}</span>
      </div>
    </div>
  );
}
