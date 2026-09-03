import Link from "next/link";
import { ArrowRight, BarChart3, Shield, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-400" />
          <span className="text-lg font-semibold tracking-tight">Trdng</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-emerald-400"
          >
            Inscription
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-12 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1.5 text-sm text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Suivi de portefeuille en temps réel
        </div>

        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Pilotez vos investissements{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            crypto
          </span>{" "}
          avec clarté
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          Trdng centralise vos actifs, visualise vos performances et vous aide
          à prendre des décisions éclairées — le tout dans une interface simple
          et sécurisée.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-3.5 text-base font-semibold text-slate-900 transition-colors hover:bg-emerald-400"
          >
            Commencer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-slate-800/50 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:border-slate-500 hover:bg-slate-800"
          >
            Connexion
          </Link>
        </div>

        <div className="mt-20 grid w-full max-w-4xl gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 text-left">
            <BarChart3 className="mb-3 h-8 w-8 text-emerald-400" />
            <h3 className="font-semibold text-white">Tableaux de bord</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Visualisez l&apos;évolution de votre portefeuille avec des
              graphiques clairs et interactifs.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 text-left">
            <TrendingUp className="mb-3 h-8 w-8 text-blue-400" />
            <h3 className="font-semibold text-white">Suivi multi-actifs</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Bitcoin, Ethereum, altcoins — gardez une vue d&apos;ensemble sur
              tous vos positions.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 text-left">
            <Shield className="mb-3 h-8 w-8 text-violet-400" />
            <h3 className="font-semibold text-white">Sécurité Supabase</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Authentification robuste et accès aux données protégé par Row Level
              Security.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
