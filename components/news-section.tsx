"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Clock,
  Flame,
  Newspaper,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useNews } from "@/hooks/use-news";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { NewsArticle, NewsCategory } from "@/types/news";
import {
  CATEGORY_COLORS,
  CATEGORY_IMAGES,
  CATEGORY_LABELS,
  categorizeArticle,
  filterArticles,
  readingTime,
  timeAgo,
} from "@/lib/news-utils";

const CATEGORIES: NewsCategory[] = [
  "all",
  "bitcoin",
  "ethereum",
  "marche",
  "regulation",
  "defi",
];

function CategoryBadge({ category }: { category: Exclude<NewsCategory, "all"> }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
      style={{ backgroundColor: `${CATEGORY_COLORS[category]}cc` }}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

function FeaturedArticle({ article }: { article: NewsArticle }) {
  const category = categorizeArticle(article.title);
  const image = CATEGORY_IMAGES[category];

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-2xl border border-border/60"
    >
      <div className="relative aspect-[21/9] min-h-[220px] w-full overflow-hidden md:min-h-[280px]">
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-emerald-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-300">
              <Flame className="h-3 w-3" />
              À la une
            </span>
            <CategoryBadge category={category} />
          </div>
          <h2 className="max-w-3xl text-2xl font-bold leading-tight tracking-tight transition-colors group-hover:text-emerald-300 md:text-4xl">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="mt-3 max-w-2xl line-clamp-2 text-sm text-muted-foreground md:text-base">
              {article.excerpt}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {article.pubDate && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {timeAgo(article.pubDate)}
              </span>
            )}
            <span>{readingTime(article.excerpt || article.title)} de lecture</span>
            <span className="flex items-center gap-1 font-medium text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100">
              Lire l&apos;article
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

function NewsCard({ article, index }: { article: NewsArticle; index: number }) {
  const category = categorizeArticle(article.title);
  const image = CATEGORY_IMAGES[category];

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-black/20"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="absolute left-3 top-3">
          <CategoryBadge category={category} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-3 font-semibold leading-snug tracking-tight transition-colors group-hover:text-emerald-400">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
            {article.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{article.pubDate ? timeAgo(article.pubDate) : "—"}</span>
          <span className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            Ouvrir
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
}

function NewsListItem({ article }: { article: NewsArticle }) {
  const category = categorizeArticle(article.title);

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 rounded-xl border border-transparent p-3 transition-all hover:border-border/60 hover:bg-muted/30"
    >
      <div
        className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: CATEGORY_COLORS[category] }}
      />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-emerald-400">
          {article.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {article.pubDate ? timeAgo(article.pubDate) : "—"}
        </p>
      </div>
    </a>
  );
}

function NewsSkeletonGrid() {
  return (
    <div className="space-y-6">
      <div className="aspect-[21/9] min-h-[220px] animate-pulse rounded-2xl bg-muted/40" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted/30" />
        ))}
      </div>
    </div>
  );
}

export function NewsSection() {
  const { articles, isLoading, error, refetch } = useNews(30);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<NewsCategory>("all");

  const filtered = useMemo(
    () => filterArticles(articles, query, category),
    [articles, query, category],
  );

  const featured = filtered[0];
  const gridArticles = filtered.slice(1);
  const trending = articles.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-violet-500/10 via-background to-emerald-500/10 p-6 md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-300">
              <Sparkles className="h-4 w-4" />
              Flux crypto en direct
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Actualités</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              {articles.length} articles · Investing.com RSS · mis à jour en temps réel
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted/60 disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Actualiser
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une actualité..."
            className="border-border/60 bg-card/50 pl-9 backdrop-blur-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                category === cat
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-sm"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <NewsSkeletonGrid />}

      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 py-20 text-center">
          <Newspaper className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 text-sm font-medium text-emerald-400 hover:underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 py-20 text-center">
          <Search className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">Aucun résultat</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Essayez un autre filtre ou une autre recherche.
          </p>
        </div>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-9">
            {featured && <FeaturedArticle article={featured} />}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {gridArticles.map((article, index) => (
                <NewsCard key={article.link} article={article} index={index} />
              ))}
            </div>
          </div>

          <aside className="xl:col-span-3">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-semibold">Trending</h3>
                </div>
                <div className="space-y-1">
                  {trending.map((article) => (
                    <NewsListItem key={`trend-${article.link}`} article={article} />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-emerald-500/10 to-violet-500/10 p-5">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Source
                </p>
                <p className="mt-2 font-semibold">Investing.com Crypto</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Flux RSS francophone · marchés & régulation
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
