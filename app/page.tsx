import { Shield } from "lucide-react";
import { LandingHero } from "@/components/landing-hero";

export default function Home() {
  return (
    <div className="flex flex-col">
      <LandingHero />

      <section className="border-t border-border/50 bg-card/30 px-6 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-md text-center sm:text-left">
            <h2 className="text-lg font-medium">Données protégées</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Authentification Supabase et accès aux données filtré par utilisateur
              (Row Level Security). Vos positions restent privées.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 px-5 py-4">
            <Shield className="h-8 w-8 shrink-0 text-emerald-400/80" />
            <div className="text-left">
              <p className="text-sm font-medium">Hébergé sur Supabase</p>
              <p className="text-xs text-muted-foreground">
                Auth, profils et portefeuille synchronisés
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
