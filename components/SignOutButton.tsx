"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800 hover:text-white"
      }
    >
      <LogOut className="h-4 w-4" />
      Déconnexion
    </button>
  );
}
