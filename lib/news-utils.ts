import type { NewsArticle, NewsCategory } from "@/types/news";

export function formatNewsDate(dateString: string) {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function timeAgo(dateString: string) {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;

  return formatNewsDate(dateString);
}

export function readingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min`;
}

export function categorizeArticle(title: string): Exclude<NewsCategory, "all"> {
  const lower = title.toLowerCase();

  if (/bitcoin|\bbtc\b/.test(lower)) return "bitcoin";
  if (/ethereum|\beth\b/.test(lower)) return "ethereum";
  if (/defi|de fi/.test(lower)) return "defi";
  if (/régulation|regulation|sec|loi|banque centrale/.test(lower)) return "regulation";

  return "marche";
}

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  all: "Tous",
  bitcoin: "Bitcoin",
  ethereum: "Ethereum",
  marche: "Marché",
  regulation: "Régulation",
  defi: "DeFi",
};

export const CATEGORY_COLORS: Record<Exclude<NewsCategory, "all">, string> = {
  bitcoin: "#f7931a",
  ethereum: "#627eea",
  marche: "#34d399",
  regulation: "#818cf8",
  defi: "#a78bfa",
};

export const CATEGORY_IMAGES: Record<Exclude<NewsCategory, "all">, string> = {
  bitcoin:
    "https://images.unsplash.com/photo-1518546305927-5a555bb7020e?w=800&q=80",
  ethereum:
    "https://images.unsplash.com/photo-1622630990017-6c4b5a976a84?w=800&q=80",
  marche:
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
  regulation:
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
  defi:
    "https://images.unsplash.com/photo-1639762681485-074b7f938aa0?w=800&q=80",
};

export function filterArticles(
  articles: NewsArticle[],
  query: string,
  category: NewsCategory,
) {
  const q = query.trim().toLowerCase();

  return articles.filter((article) => {
    const cat = categorizeArticle(article.title);
    const matchesCategory = category === "all" || cat === category;
    const matchesQuery =
      !q ||
      article.title.toLowerCase().includes(q) ||
      article.excerpt.toLowerCase().includes(q);

    return matchesCategory && matchesQuery;
  });
}
