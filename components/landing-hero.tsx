"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, LineChart, TrendingUp } from "lucide-react";
import { DotGlobeHero } from "@/components/ui/globe-hero";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <DotGlobeHero rotationSpeed={0.003} className="bg-[#0a0f14]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f14]/40 via-transparent to-[#0a0f14]" />

      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <TrendingUp className="h-5 w-5 text-emerald-400" strokeWidth={2.5} />
          <span className="text-base font-semibold tracking-tight">Trdng</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/login">Connexion</Link>
          </Button>
          <Button
            asChild
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            <Link href="/register">Inscription</Link>
          </Button>
        </nav>
      </header>

      <div className="relative z-10 mx-auto flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-sm text-emerald-300/90"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Suivi portefeuille · cours en direct
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl space-y-6"
        >
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Tout votre crypto,
            <span className="mt-2 block text-emerald-400">au même endroit.</span>
          </h1>

          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Ajoutez vos positions, suivez le P&amp;L en temps réel et consultez
            l&apos;actualité marché — sans tableur ni onglets ouverts en boucle.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4"
        >
          <Button
            size="lg"
            asChild
            className="h-12 bg-emerald-500 px-8 text-base text-slate-950 hover:bg-emerald-400"
          >
            <Link href="/register">
              Créer un compte
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="h-12 border-border/60 bg-background/40 px-8 text-base backdrop-blur-sm hover:bg-background/70"
          >
            <Link href="/login">J&apos;ai déjà un compte</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid w-full max-w-3xl gap-px overflow-hidden rounded-2xl border border-border/50 bg-border/50 sm:grid-cols-3"
        >
          {[
            {
              icon: LineChart,
              label: "Prix live",
              detail: "BTC, ETH, SOL et plus",
            },
            {
              icon: BarChart3,
              label: "Performance",
              detail: "Plus-values et allocation",
            },
            {
              icon: TrendingUp,
              label: "Actualités",
              detail: "Flux RSS intégré au dashboard",
            },
          ].map(({ icon: Icon, label, detail }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 bg-card/80 px-4 py-5 backdrop-blur-sm sm:items-start sm:px-5"
            >
              <Icon className="h-4 w-4 text-emerald-400" />
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{detail}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </DotGlobeHero>
  );
}
