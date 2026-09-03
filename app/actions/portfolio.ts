"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type PortfolioActionState = {
  error?: string;
  success?: boolean;
};

function normalizeSymbol(raw: string) {
  const symbol = raw.trim().toUpperCase();
  if (!symbol) return "";
  return symbol.endsWith("USDT") ? symbol : `${symbol}USDT`;
}

export async function addAsset(
  _prevState: PortfolioActionState,
  formData: FormData,
): Promise<PortfolioActionState> {
  const symbolInput = formData.get("symbol");
  const quantityInput = formData.get("quantity");
  const purchasePriceInput = formData.get("purchase_price");

  if (
    typeof symbolInput !== "string" ||
    typeof quantityInput !== "string" ||
    typeof purchasePriceInput !== "string"
  ) {
    return { error: "Tous les champs sont requis." };
  }

  const symbol = normalizeSymbol(symbolInput);
  const quantity = Number.parseFloat(quantityInput);
  const purchase_price = Number.parseFloat(purchasePriceInput);

  if (!symbol) {
    return { error: "Symbole invalide." };
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { error: "La quantité doit être supérieure à 0." };
  }

  if (!Number.isFinite(purchase_price) || purchase_price <= 0) {
    return { error: "Le prix d'achat doit être supérieur à 0." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté." };
  }

  const { error } = await supabase.from("portfolio_items").insert({
    user_id: user.id,
    symbol,
    quantity,
    purchase_price,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAsset(id: string): Promise<PortfolioActionState> {
  if (!id) {
    return { error: "Actif introuvable." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté." };
  }

  const { error } = await supabase
    .from("portfolio_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
