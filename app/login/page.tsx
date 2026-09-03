"use client";

import Link from "next/link";
import { useActionState } from "react";
import { TrendingUp } from "lucide-react";
import { login, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center px-6 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
            <span className="text-lg font-semibold">Trdng</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Connexion</h1>
          <p className="mt-2 text-sm text-slate-400">
            Accédez à votre tableau de bord crypto
          </p>
        </div>

        <form
          action={formAction}
          className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-8 shadow-xl backdrop-blur-sm"
        >
          {state.error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {state.error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-2.5 text-white placeholder:text-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="vous@exemple.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-2.5 text-white placeholder:text-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-6 w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Connexion..." : "Se connecter"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-400">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-medium text-emerald-400 hover:text-emerald-300">
              Inscription
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
