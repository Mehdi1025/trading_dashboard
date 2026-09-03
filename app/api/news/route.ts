import Parser from "rss-parser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RSS_URL = "https://fr.investing.com/rss/news_301.rss";
const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 30;

export type NewsArticle = {
  title: string;
  link: string;
  pubDate: string;
  excerpt: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number.parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  try {
    const parser = new Parser({
      timeout: 10000,
      headers: {
        "User-Agent": "Trdng/1.0 (RSS Reader)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    const feed = await parser.parseURL(RSS_URL);

    const articles: NewsArticle[] = (feed.items ?? [])
      .slice(0, limit)
      .map((item) => ({
        title: item.title?.trim() ?? "Sans titre",
        link: item.link ?? "",
        pubDate: item.pubDate ?? item.isoDate ?? "",
        excerpt: (item.contentSnippet ?? item.summary ?? "").trim(),
      }))
      .filter((item) => item.link);

    return Response.json(articles);
  } catch {
    return Response.json(
      { error: "Impossible de récupérer les actualités crypto pour le moment." },
      { status: 500 },
    );
  }
}
