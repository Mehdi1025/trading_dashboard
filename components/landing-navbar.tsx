"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Produit", href: "#product" },
  { label: "Fonctionnalités", href: "#features" },
  { label: "Sécurité", href: "#security" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-white/[0.06] bg-[#060a0e]/75 py-3 shadow-lg shadow-black/20 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent py-5",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 transition-all duration-300 group-hover:border-emerald-500/45 group-hover:bg-emerald-500/15 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]">
              <TrendingUp
                className="h-4 w-4 text-emerald-400"
                strokeWidth={2.5}
              />
            </div>
            <span className="text-base font-semibold tracking-tight">Trdng</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <Button
              variant="ghost"
              asChild
              className="text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
            >
              <Link href="/login">Connexion</Link>
            </Button>
            <Button
              asChild
              className="bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400"
            >
              <Link href="/register">Inscription</Link>
            </Button>
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-foreground transition-colors hover:bg-white/[0.06] md:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#060a0e]/90 backdrop-blur-md md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.nav
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="mx-auto flex max-w-sm flex-col gap-2 px-6 pt-24"
              onClick={(e) => e.stopPropagation()}
            >
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-base font-medium transition-colors hover:bg-white/[0.06]"
                >
                  {label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-white/[0.06] pt-4">
                <Button
                  variant="outline"
                  asChild
                  className="h-11 border-white/10 bg-white/[0.03]"
                >
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Connexion
                  </Link>
                </Button>
                <Button
                  asChild
                  className="h-11 bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                >
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    Inscription
                  </Link>
                </Button>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
