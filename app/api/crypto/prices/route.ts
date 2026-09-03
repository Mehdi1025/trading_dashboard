import { fetchBinancePrices } from "@/lib/binance-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prices = await fetchBinancePrices();
    return Response.json(prices, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Impossible de récupérer les cours crypto pour le moment." },
      { status: 502 },
    );
  }
}
