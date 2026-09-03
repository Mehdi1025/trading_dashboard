import {
  fetchBinanceTick,
  fetchCoinGeckoTick,
  toBinanceSymbol,
} from "@/lib/binance-rest";
import { getTradingPair, isValidPairId } from "@/lib/crypto-pairs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pairParam = searchParams.get("pair") ?? "BTC-USD";

  if (!isValidPairId(pairParam)) {
    return Response.json({ error: "Invalid trading pair" }, { status: 400 });
  }

  const pair = getTradingPair(pairParam)!;
  const binanceSymbol = toBinanceSymbol(pair.symbol);

  const tick =
    (await fetchBinanceTick(binanceSymbol, pair.id, pair.symbol)) ??
    (await fetchCoinGeckoTick(pair.coingeckoId, pair.id, pair.symbol));

  if (!tick) {
    return Response.json(
      { error: "Impossible de récupérer le cours pour cette paire." },
      { status: 502 },
    );
  }

  return Response.json(tick, { headers: { "Cache-Control": "no-store" } });
}
