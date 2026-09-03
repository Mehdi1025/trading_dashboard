"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Check,
  Lock,
  Shield,
  Smartphone,
  TrendingUp,
} from "lucide-react";
import { useRef } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { FeaturesEight } from "@/components/ui/features-8";

const TICKERS = [
  { sym: "BTC", price: "97 842 €", chg: "+2.4%" },
  { sym: "ETH", price: "3 521 €", chg: "+1.8%" },
  { sym: "SOL", price: "198 €", chg: "-0.6%" },
  { sym: "XRP", price: "2.41 €", chg: "+3.1%" },
  { sym: "ADA", price: "0.98 €", chg: "+0.9%" },
  { sym: "DOT", price: "7.12 €", chg: "-1.2%" },
  { sym: "AVAX", price: "38.4 €", chg: "+4.2%" },
  { sym: "LINK", price: "18.7 €", chg: "+1.1%" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-emerald-400/80">
      <span className="h-px w-6 bg-emerald-500/40" />
      {children}
    </span>
  );
}

function TickerMarquee() {
  const items = [...TICKERS, ...TICKERS];

  return (
    <div className="relative overflow-hidden border-y border-white/[0.06] bg-[#080c11]/80 py-4 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#080c11] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#080c11] to-transparent" />
      <div className="animate-marquee flex w-max gap-10 px-6">
        {items.map(({ sym, price, chg }, i) => {
          const up = chg.startsWith("+");
          return (
            <div
              key={`${sym}-${i}`}
              className="flex shrink-0 items-center gap-4 font-mono text-sm"
            >
              <span className="font-semibold text-foreground/90">{sym}</span>
              <span className="text-muted-foreground">{price}</span>
              <span className={up ? "text-emerald-400" : "text-rose-400"}>
                {chg}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [24, -24]);

  const highlights = [
    "KPIs clairs : valeur totale, capital investi et P&L global",
    "Courbes de performance live et répartition par actif",
    "Actualités crypto et aperçu rapide des paires suivies",
  ];

  return (
    <section ref={ref} id="product" className="relative py-32 md:py-40 lg:py-44 scroll-mt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_10%_50%,rgba(52,211,153,0.09),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(ellipse_at_left,rgba(52,211,153,0.04),transparent_70%)]" />

      <div className="relative mx-auto grid max-w-[1500px] -translate-x-3 items-center gap-14 px-6 sm:px-8 sm:-translate-x-4 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)] lg:-translate-x-6 lg:gap-20 lg:px-10 xl:-translate-x-8 xl:gap-28 xl:px-14">
        {/* Gauche — image */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ y }}
          className="relative justify-self-start lg:-ml-14 lg:mr-6 xl:-ml-20 xl:mr-10 2xl:-ml-24"
        >
          <div className="pointer-events-none absolute -inset-8 bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.16),transparent_68%)]" />
          <Image
            src="/dashboard-preview.png"
            alt="Aperçu du tableau de bord Trdng sur MacBook — KPIs, performance, allocation et actualités crypto"
            width={1920}
            height={1080}
            priority
            className="relative h-auto w-full max-w-[92%] origin-left scale-100 drop-shadow-[0_36px_72px_rgba(0,0,0,0.5)] lg:max-w-full lg:scale-[1.22] xl:scale-[1.28]"
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
        </motion.div>

        {/* Droite — texte */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="w-full max-w-xl justify-self-end lg:max-w-2xl lg:pl-8 xl:max-w-3xl xl:pl-12"
        >
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-400/80">
              <span className="h-px w-6 bg-emerald-500/40" />
              Aperçu produit
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[2.85rem] lg:leading-[1.06] xl:text-[3.35rem]"
          >
            Un écran.{" "}
            <span className="text-emerald-400">Toutes vos réponses.</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            Trdng regroupe ce dont vous avez besoin avant d&apos;ouvrir un
            exchange ou un tableur : où vous en êtes, ce qui bouge, et ce qui
            mérite votre attention aujourd&apos;hui.
          </motion.p>

          <motion.ul
            variants={fadeUp}
            custom={3}
            className="mt-8 space-y-4"
          >
            {highlights.map((item) => (
              <li key={item} className="flex gap-3 text-base sm:text-lg">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                  <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2.5} />
                </span>
                <span className="leading-relaxed text-foreground/85">{item}</span>
              </li>
            ))}
          </motion.ul>

          <motion.div variants={fadeUp} custom={4} className="mt-10">
            <Button
              size="lg"
              asChild
              className="h-14 bg-emerald-500 px-8 text-lg text-slate-950 hover:bg-emerald-400"
            >
              <Link href="/register">
                Voir le dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="mt-3 text-sm text-muted-foreground">
              Gratuit · Compte prêt en moins d&apos;une minute
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function MobilePreview() {
  const highlights = [
    "Graphiques live BTC, ETH, SOL — flux Coinbase en direct",
    "Onglets Graphique, Performance et Marché sur mobile",
    "Même dashboard responsive que sur desktop",
  ];

  return (
    <section className="relative scroll-mt-24 border-t border-white/[0.06] bg-[#060a0e] py-24 md:py-32 lg:py-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_15%_50%,rgba(52,211,153,0.06),transparent_55%)]" />

      <div className="relative mx-auto grid max-w-[1300px] items-center gap-12 px-6 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:px-10 xl:gap-24">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative flex justify-center lg:justify-start"
        >
          <div className="pointer-events-none absolute -inset-6 bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.12),transparent_70%)]" />
          <Image
            src="/mobile-preview-v3.png"
            alt="Aperçu mobile Trdng — graphique BTC/USD live, onglets Graphique, Performance et Marché"
            width={1568}
            height={2696}
            className="relative h-auto w-full max-w-[300px] drop-shadow-[0_28px_56px_rgba(0,0,0,0.45)] sm:max-w-[340px] lg:max-w-[380px] xl:max-w-[420px]"
            sizes="(max-width: 1024px) 300px, 420px"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="lg:pl-4 xl:pl-8"
        >
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-400/80">
              <span className="h-px w-6 bg-emerald-500/40" />
              Mobile
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-5 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-[2.75rem]"
          >
            Le marché dans{" "}
            <span className="text-emerald-400">votre poche.</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Sur téléphone comme sur MacBook : graphiques live, sélecteur de paires
            et onglets Performance — le dashboard Trdng s&apos;adapte à votre écran.
          </motion.p>

          <motion.ul variants={fadeUp} custom={3} className="mt-8 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex gap-3 text-base">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                  <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2.5} />
                </span>
                <span className="leading-relaxed text-foreground/85">{item}</span>
              </li>
            ))}
          </motion.ul>

          <motion.div variants={fadeUp} custom={4} className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
            <Smartphone className="h-4 w-4 text-emerald-400" />
            Interface responsive · iOS & Android via navigateur
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function WorkflowSteps() {
  const steps = [
    {
      n: "01",
      title: "Créez votre compte",
      desc: "Inscription en 30 secondes. Vos données restent isolées par profil.",
    },
    {
      n: "02",
      title: "Ajoutez vos positions",
      desc: "Symbole, quantité et prix d'achat — le reste se calcule automatiquement.",
    },
    {
      n: "03",
      title: "Pilotez en live",
      desc: "Dashboard, news et fiscalité accessibles depuis la même sidebar.",
    },
  ];

  return (
    <section className="border-y border-white/[0.06] bg-white/[0.01] px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <SectionLabel>Démarrage</SectionLabel>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Opérationnel en trois étapes
          </h2>
        </div>

        <div className="relative grid gap-10 md:grid-cols-3 md:gap-8">
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent md:block" />
          {steps.map(({ n, title, desc }, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="relative text-center md:text-left"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 font-mono text-lg text-emerald-400 md:mx-0">
                {n}
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section id="security" className="scroll-mt-24 px-6 py-28">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <SectionLabel>Sécurité</SectionLabel>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Vos positions restent
            <span className="text-emerald-400"> privées.</span>
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground leading-relaxed">
            Authentification Supabase, sessions sécurisées et Row Level Security
            sur chaque requête. Seul vous (ou votre conseiller admin) accédez à
            vos données.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "RLS activé sur profiles et portfolio",
              "Clés anon côté client uniquement",
              "Middleware de protection des routes",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <Lock className="h-4 w-4 shrink-0 text-emerald-400/70" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="relative"
        >
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-indigo-500/5 blur-xl" />
          <div className="relative flex h-full flex-col justify-center gap-6 rounded-2xl border border-white/[0.08] bg-[#0c1017]/80 p-8 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <Shield className="h-10 w-10 shrink-0 text-emerald-400/80" />
              <div>
                <p className="font-semibold">Hébergé sur Supabase</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Auth, profils et portefeuille synchronisés en temps réel.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { k: "Uptime", v: "99.9%" },
                { k: "Chiffrement", v: "TLS" },
                { k: "Région", v: "EU" },
                { k: "RLS", v: "Actif" },
              ].map(({ k, v }) => (
                <div
                  key={k}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {k}
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-medium">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-6 pb-8 pt-12">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-indigo-500/10" />
        <BorderBeam size={250} duration={12} colorFrom="#34d399" colorTo="#6366f1" />
        <div className="relative px-8 py-16 text-center md:px-16 md:py-20">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Prêt à centraliser votre suivi crypto ?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Compte gratuit. Aucune carte requise. Connectez-vous et ajoutez votre
            première position en moins d&apos;une minute.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="h-12 bg-emerald-500 px-8 text-slate-950 hover:bg-emerald-400"
            >
              <Link href="/register">
                Commencer maintenant
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild className="h-12">
              <Link href="/login">Se connecter</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-medium">Trdng</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">
            Suivi portefeuille crypto
          </span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/login" className="transition-colors hover:text-foreground">
            Connexion
          </Link>
          <Link href="/register" className="transition-colors hover:text-foreground">
            Inscription
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function LandingSections() {
  return (
    <div className="relative bg-[#060a0e]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      <TickerMarquee />
      <DashboardPreview />
      <MobilePreview />
      <FeaturesEight />
      <WorkflowSteps />
      <TrustSection />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
