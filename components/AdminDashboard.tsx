"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { ClientProfile } from "@/types/admin";
import type { PortfolioItem } from "@/types/portfolio";

type AdminDashboardProps = {
  clients: ClientProfile[];
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const quantityFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 8,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function computeInitialCapital(items: PortfolioItem[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.purchase_price, 0);
}

function computeCurrentValue(items: PortfolioItem[], prices: Record<string, number>) {
  return items.reduce((sum, item) => {
    const price = prices[item.symbol];
    if (price === undefined) return sum;
    return sum + item.quantity * price;
  }, 0);
}

function computeAssetMetrics(item: PortfolioItem, prices: Record<string, number>) {
  const currentPrice = prices[item.symbol];
  const costBasis = item.quantity * item.purchase_price;
  const currentValue =
    currentPrice !== undefined ? item.quantity * currentPrice : null;
  const pnlDollar = currentValue !== null ? currentValue - costBasis : null;
  const pnlPercent =
    pnlDollar !== null && costBasis > 0 ? (pnlDollar / costBasis) * 100 : null;

  return { currentPrice, costBasis, currentValue, pnlDollar, pnlPercent };
}

export function AdminDashboard({ clients }: AdminDashboardProps) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/crypto/stream");

    eventSource.onmessage = (event) => {
      try {
        const incoming = JSON.parse(event.data) as Record<string, number>;
        setPrices(incoming);
      } catch {
        // Ignore malformed SSE payloads.
      }
    };

    return () => eventSource.close();
  }, []);

  const clientRows = useMemo(
    () =>
      clients.map((client) => {
        const initialCapital = computeInitialCapital(client.portfolio_items);
        const currentValue = computeCurrentValue(client.portfolio_items, prices);
        const hasLiveData = client.portfolio_items.some(
          (item) => prices[item.symbol] !== undefined,
        );
        const pnlDollar = hasLiveData ? currentValue - initialCapital : null;
        const pnlPercent =
          pnlDollar !== null && initialCapital > 0
            ? (pnlDollar / initialCapital) * 100
            : null;

        return {
          client,
          initialCapital,
          currentValue,
          hasLiveData,
          pnlDollar,
          pnlPercent,
        };
      }),
    [clients, prices],
  );

  const totalAum = clientRows.reduce(
    (sum, row) => sum + (row.hasLiveData ? row.currentValue : 0),
    0,
  );

  const totalInitialCapital = clientRows.reduce(
    (sum, row) => sum + row.initialCapital,
    0,
  );

  const globalPnl = totalAum - totalInitialCapital;
  const globalPnlPercent =
    totalInitialCapital > 0 ? (globalPnl / totalInitialCapital) * 100 : 0;

  function toggleClient(clientId: string) {
    setExpandedClientId((current) => (current === clientId ? null : clientId));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">Total AUM</p>
            <Wallet className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">
            {totalAum > 0 ? formatCurrency(totalAum) : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Valorisation live de tous les portefeuilles
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">PnL global</p>
            {globalPnl >= 0 ? (
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-400" />
            )}
          </div>
          <p
            className={`mt-3 text-3xl font-bold ${
              globalPnl >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {totalAum > 0 ? formatCurrency(globalPnl) : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {totalAum > 0 ? formatPercent(globalPnlPercent) : "En attente des cours"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">Clients actifs</p>
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{clients.length}</p>
          <p className="mt-1 text-xs text-slate-500">Investisseurs suivis</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700/60">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-4 font-medium" />
                <th className="px-6 py-4 font-medium">Nom</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Capital initial</th>
                <th className="px-6 py-4 font-medium">Valorisation actuelle</th>
                <th className="px-6 py-4 font-medium">PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {clientRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Aucun investisseur enregistré.
                  </td>
                </tr>
              ) : (
                clientRows.map(
                  ({
                    client,
                    initialCapital,
                    currentValue,
                    hasLiveData,
                    pnlDollar,
                    pnlPercent,
                  }) => {
                    const isExpanded = expandedClientId === client.id;

                    return (
                      <Fragment key={client.id}>
                        <tr
                          onClick={() => toggleClient(client.id)}
                          className="cursor-pointer text-sm text-slate-200 transition-colors hover:bg-slate-700/30"
                        >
                          <td className="px-6 py-4 text-slate-400">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold text-white">
                            {client.name}
                          </td>
                          <td className="px-6 py-4 text-slate-300">{client.email}</td>
                          <td className="px-6 py-4">
                            {formatCurrency(initialCapital)}
                          </td>
                          <td className="px-6 py-4">
                            {hasLiveData ? formatCurrency(currentValue) : "—"}
                          </td>
                          <td className="px-6 py-4">
                            {pnlDollar !== null && pnlPercent !== null ? (
                              <div
                                className={
                                  pnlDollar >= 0 ? "text-emerald-400" : "text-red-400"
                                }
                              >
                                <p className="font-medium">{formatCurrency(pnlDollar)}</p>
                                <p className="text-xs">{formatPercent(pnlPercent)}</p>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-slate-900/50">
                            <td colSpan={6} className="px-6 py-4">
                              <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-4">
                                <h3 className="mb-4 text-sm font-semibold text-slate-300">
                                  Détail du portefeuille — {client.name}
                                </h3>

                                {client.portfolio_items.length === 0 ? (
                                  <p className="text-sm text-slate-400">
                                    Aucun actif dans ce portefeuille.
                                  </p>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                      <thead>
                                        <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                                          <th className="pb-3 pr-4 font-medium">Symbole</th>
                                          <th className="pb-3 pr-4 font-medium">Quantité</th>
                                          <th className="pb-3 pr-4 font-medium">
                                            Prix d&apos;achat
                                          </th>
                                          <th className="pb-3 pr-4 font-medium">
                                            Prix actuel
                                          </th>
                                          <th className="pb-3 pr-4 font-medium">
                                            Valeur totale
                                          </th>
                                          <th className="pb-3 font-medium">PnL</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-700/40">
                                        {client.portfolio_items.map((item) => {
                                          const {
                                            currentPrice,
                                            currentValue: assetValue,
                                            pnlDollar: assetPnl,
                                            pnlPercent: assetPnlPercent,
                                          } = computeAssetMetrics(item, prices);

                                          return (
                                            <tr key={item.id} className="text-slate-200">
                                              <td className="py-3 pr-4 font-medium text-white">
                                                {item.symbol}
                                              </td>
                                              <td className="py-3 pr-4">
                                                {quantityFormatter.format(item.quantity)}
                                              </td>
                                              <td className="py-3 pr-4">
                                                {formatCurrency(item.purchase_price)}
                                              </td>
                                              <td className="py-3 pr-4">
                                                {currentPrice !== undefined
                                                  ? formatCurrency(currentPrice)
                                                  : "—"}
                                              </td>
                                              <td className="py-3 pr-4">
                                                {assetValue !== null
                                                  ? formatCurrency(assetValue)
                                                  : "—"}
                                              </td>
                                              <td className="py-3">
                                                {assetPnl !== null &&
                                                assetPnlPercent !== null ? (
                                                  <div
                                                    className={
                                                      assetPnl >= 0
                                                        ? "text-emerald-400"
                                                        : "text-red-400"
                                                    }
                                                  >
                                                    <p>{formatCurrency(assetPnl)}</p>
                                                    <p className="text-xs">
                                                      {formatPercent(assetPnlPercent)}
                                                    </p>
                                                  </div>
                                                ) : (
                                                  "—"
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  },
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
