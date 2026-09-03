"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { DotGlobeHero } from "@/components/ui/globe-hero";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <DotGlobeHero rotationSpeed={0.0025} globeRadius={1.05}>
      <div className="relative z-10 mx-auto flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-28 text-center sm:pt-32">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-emerald-300/90 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Suivi portefeuille · cours en direct
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl space-y-6"
        >
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Tout votre crypto,
            <span className="mt-1 block bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              au même endroit.
            </span>
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
            className="h-12 bg-emerald-500 px-8 text-base text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
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
            className="h-12 border-white/10 bg-white/[0.03] px-8 text-base backdrop-blur-md hover:bg-white/[0.06]"
          >
            <Link href="/login">J&apos;ai déjà un compte</Link>
          </Button>
        </motion.div>
      </div>

      <motion.a
        href="#features"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>Découvrir</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </motion.a>
    </DotGlobeHero>
  );
}
