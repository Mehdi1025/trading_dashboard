export type TradingPair = {
  id: string;
  symbol: string;
  name: string;
  coinbaseId: string;
  coingeckoId: string;
  color: string;
  gradient: string;
  category: "major" | "alt";
};

export const TRADING_PAIRS: TradingPair[] = [
  {
    id: "BTC-USD",
    symbol: "BTC",
    name: "Bitcoin",
    coinbaseId: "BTC-USD",
    coingeckoId: "bitcoin",
    color: "#f7931a",
    gradient: "from-orange-500/20 to-amber-500/5",
    category: "major",
  },
  {
    id: "ETH-USD",
    symbol: "ETH",
    name: "Ethereum",
    coinbaseId: "ETH-USD",
    coingeckoId: "ethereum",
    color: "#627eea",
    gradient: "from-indigo-500/20 to-violet-500/5",
    category: "major",
  },
  {
    id: "SOL-USD",
    symbol: "SOL",
    name: "Solana",
    coinbaseId: "SOL-USD",
    coingeckoId: "solana",
    color: "#14f195",
    gradient: "from-emerald-500/20 to-cyan-500/5",
    category: "major",
  },
  {
    id: "XRP-USD",
    symbol: "XRP",
    name: "Ripple",
    coinbaseId: "XRP-USD",
    coingeckoId: "ripple",
    color: "#0085c3",
    gradient: "from-sky-500/20 to-blue-500/5",
    category: "major",
  },
  {
    id: "ADA-USD",
    symbol: "ADA",
    name: "Cardano",
    coinbaseId: "ADA-USD",
    coingeckoId: "cardano",
    color: "#0033ad",
    gradient: "from-blue-600/20 to-indigo-500/5",
    category: "alt",
  },
  {
    id: "DOGE-USD",
    symbol: "DOGE",
    name: "Dogecoin",
    coinbaseId: "DOGE-USD",
    coingeckoId: "dogecoin",
    color: "#c2a633",
    gradient: "from-yellow-500/20 to-amber-500/5",
    category: "alt",
  },
  {
    id: "AVAX-USD",
    symbol: "AVAX",
    name: "Avalanche",
    coinbaseId: "AVAX-USD",
    coingeckoId: "avalanche-2",
    color: "#e84142",
    gradient: "from-red-500/20 to-rose-500/5",
    category: "alt",
  },
  {
    id: "LINK-USD",
    symbol: "LINK",
    name: "Chainlink",
    coinbaseId: "LINK-USD",
    coingeckoId: "chainlink",
    color: "#2a5ada",
    gradient: "from-blue-500/20 to-indigo-500/5",
    category: "alt",
  },
  {
    id: "DOT-USD",
    symbol: "DOT",
    name: "Polkadot",
    coinbaseId: "DOT-USD",
    coingeckoId: "polkadot",
    color: "#e6007a",
    gradient: "from-pink-500/20 to-fuchsia-500/5",
    category: "alt",
  },
  {
    id: "MATIC-USD",
    symbol: "MATIC",
    name: "Polygon",
    coinbaseId: "MATIC-USD",
    coingeckoId: "matic-network",
    color: "#8247e5",
    gradient: "from-violet-500/20 to-purple-500/5",
    category: "alt",
  },
];

export const DEFAULT_PAIR_ID = "BTC-USD";

export function getTradingPair(id: string): TradingPair | undefined {
  return TRADING_PAIRS.find((pair) => pair.id === id);
}

export function isValidPairId(id: string): boolean {
  return TRADING_PAIRS.some((pair) => pair.id === id);
}
