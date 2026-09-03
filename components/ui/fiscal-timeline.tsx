"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  FileText,
  Gift,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/portfolio-metrics";

type FiscalEventType = "BUY" | "SELL" | "AIRDROP";

interface FiscalEvent {
  id: string;
  date: string;
  type: FiscalEventType;
  asset: string;
  amount: number;
  price: number;
  taxImpact: number;
  description: string;
}

const MOCK_EVENTS: FiscalEvent[] = [
  {
    id: "1",
    date: "2024-09-12",
    type: "BUY",
    asset: "BTC",
    amount: 0.25,
    price: 58200,
    taxImpact: 0,
    description: "Achat spot — position long terme ouverte sur Binance.",
  },
  {
    id: "2",
    date: "2024-10-03",
    type: "AIRDROP",
    asset: "SOL",
    amount: 42,
    price: 142.5,
    taxImpact: 5985,
    description: "Airdrop protocol — revenu imposable à la réception.",
  },
  {
    id: "3",
    date: "2024-11-18",
    type: "SELL",
    asset: "ETH",
    amount: 2.5,
    price: 3280,
    taxImpact: 1850,
    description: "Vente partielle — plus-value réalisée sur position 2023.",
  },
  {
    id: "4",
    date: "2024-12-05",
    type: "BUY",
    asset: "ETH",
    amount: 1.8,
    price: 3650,
    taxImpact: 0,
    description: "Renforcement de position avant fin d'année fiscale.",
  },
  {
    id: "5",
    date: "2025-01-22",
    type: "SELL",
    asset: "BTC",
    amount: 0.08,
    price: 98500,
    taxImpact: 3240,
    description: "Prise de profit — gain imposable sur fraction vendue.",
  },
  {
    id: "6",
    date: "2025-02-14",
    type: "AIRDROP",
    asset: "ARB",
    amount: 1200,
    price: 1.85,
    taxImpact: 2220,
    description: "Distribution governance token — valeur marché à réception.",
  },
  {
    id: "7",
    date: "2025-03-08",
    type: "BUY",
    asset: "SOL",
    amount: 15,
    price: 168,
    taxImpact: 0,
    description: "Accumulation SOL — staking prévu Q2.",
  },
];

const TYPE_CONFIG: Record<
  FiscalEventType,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    border: string;
    bg: string;
    ring: string;
  }
> = {
  BUY: {
    label: "Achat",
    icon: <ArrowDownRight className="h-4 w-4" />,
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/40",
  },
  SELL: {
    label: "Vente",
    icon: <ArrowUpRight className="h-4 w-4" />,
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    ring: "ring-red-500/40",
  },
  AIRDROP: {
    label: "Airdrop",
    icon: <Gift className="h-4 w-4" />,
    color: "text-violet-400",
    border: "border-violet-500/30",
    bg: "bg-violet-500/10",
    ring: "ring-violet-500/40",
  },
};

function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function FiscalReportButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isGenerating) return;

    const timer = setTimeout(() => {
      setIsGenerating(false);
      setIsDone(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isGenerating]);

  function handleClick() {
    if (isDone) return;
    if (!isGenerating) {
      setIsGenerating(true);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative mx-auto mt-16 max-w-xl"
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={isGenerating}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border px-6 py-5 text-base font-semibold transition-all duration-500",
          isDone
            ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-500/20"
            : "border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-600 hover:bg-slate-900/90",
          isGenerating && "cursor-wait",
        )}
      >
        <AnimatePresence mode="wait">
          {isGenerating && (
            <motion.div
              key="laser"
              initial={{ left: "0%" }}
              animate={{ left: "100%" }}
              transition={{ duration: 2, ease: "linear" }}
              className="pointer-events-none absolute inset-y-0 z-10 w-1 bg-cyan-400 shadow-[0_0_20px_4px_rgba(34,211,238,0.8),0_0_60px_12px_rgba(34,211,238,0.4)]"
            />
          )}
        </AnimatePresence>

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-cyan-400/10 to-cyan-500/5"
          />
        )}

        <span className="relative z-20 flex items-center justify-center gap-2.5">
          {isDone ? (
            <>
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              Télécharger le PDF
            </>
          ) : isGenerating ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block h-4 w-4 rounded-full border-2 border-cyan-400 border-t-transparent"
              />
              Compilation des données...
            </>
          ) : (
            <>
              <FileText className="h-5 w-5 text-cyan-400" />
              Générer le rapport Fiscal 2024
            </>
          )}
        </span>
      </button>

      {!isDone && !isGenerating && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Export PDF · conforme aux transactions enregistrées
        </p>
      )}
    </motion.div>
  );
}

export function FiscalTimeline() {
  const realizedGains = 4250;
  const latentGains = 12400;

  return (
    <section className="relative mx-auto max-w-5xl">
      <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-orange-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-10"
      >
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-300">
          <Sparkles className="h-4 w-4" />
          Timeline Fiscale & Dividendes
        </div>
        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
          Historique fiscal narratif
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Retracez vos achats, ventes et airdrops sur les 6 derniers mois avec l&apos;impact
          fiscal associé.
        </p>
      </motion.div>

      <div className="relative mb-14 grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-card/30 p-6 backdrop-blur-md"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400/80">
            Gains réalisés (imposables)
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-orange-400">
            +{formatCurrency(realizedGains)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ventes et airdrops déclarables cette année
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-card/30 p-6 backdrop-blur-md"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400/80">
            Gains latents (non imposables)
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-400">
            +{formatCurrency(latentGains)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Plus-values non réalisées sur positions ouvertes
          </p>
        </motion.div>
      </div>

      <div className="relative">
        <div
          aria-hidden
          className="absolute bottom-0 left-4 top-0 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent md:left-1/2 md:-translate-x-px"
        />

        <div className="space-y-10 md:space-y-14">
          {MOCK_EVENTS.map((event, index) => {
            const config = TYPE_CONFIG[event.type];
            const isLeft = index % 2 === 0;
            const totalValue = event.amount * event.price;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.55, delay: index * 0.05 }}
                className={cn(
                  "relative flex",
                  "md:w-1/2",
                  isLeft ? "md:ml-0 md:pr-10" : "md:ml-auto md:pl-10",
                )}
              >
                <div
                  className={cn(
                    "absolute top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-background",
                    config.bg,
                    config.ring,
                    "left-4 md:left-auto",
                    isLeft ? "md:-right-4" : "md:-left-4",
                  )}
                >
                  <span className={config.color}>{config.icon}</span>
                </div>

                <article
                  className={cn(
                    "ml-14 w-full rounded-2xl border bg-slate-950/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/15 hover:shadow-xl hover:shadow-black/20 md:ml-0",
                    config.border,
                  )}
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
                        config.bg,
                        config.color,
                      )}
                    >
                      {config.icon}
                      {config.label}
                    </span>
                    <time className="text-xs text-muted-foreground">
                      {formatEventDate(event.date)}
                    </time>
                  </div>

                  <h3 className="text-lg font-semibold tracking-tight">
                    {event.amount} {event.asset}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      @ {formatCurrency(event.price)}
                    </span>
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {event.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
                    <span className="text-xs text-muted-foreground">
                      Valeur :{" "}
                      <span className="font-medium text-foreground">
                        {formatCurrency(totalValue)}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        event.taxImpact > 0
                          ? "text-orange-400"
                          : event.taxImpact < 0
                            ? "text-red-400"
                            : "text-muted-foreground",
                      )}
                    >
                      Impact fiscal :{" "}
                      {event.taxImpact === 0
                        ? "—"
                        : `${event.taxImpact > 0 ? "+" : ""}${formatCurrency(event.taxImpact)}`}
                    </span>
                  </div>
                </article>
              </motion.div>
            );
          })}
        </div>
      </div>

      <FiscalReportButton />
    </section>
  );
}
