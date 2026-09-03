"use client";

import { ArrowRight, Newspaper } from "lucide-react";
import { useNews } from "@/hooks/use-news";
import { timeAgo } from "@/lib/news-utils";
import { cn } from "@/lib/utils";

type NewsFeedProps = {
  limit?: number;
  compact?: boolean;
  onViewAll?: () => void;
  className?: string;
};

function NewsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="space-y-2 border-b border-border/60 pb-4 last:border-0">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted/70" />
        </div>
      ))}
    </div>
  );
}

export function NewsFeed({
  limit = 4,
  compact = false,
  onViewAll,
  className,
}: NewsFeedProps) {
  const { articles, isLoading, error } = useNews(limit);
  const displayed = compact ? articles.slice(0, limit) : articles;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xl",
        compact ? "p-5" : "p-6",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
            <Newspaper className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">Actualités</h2>
            {compact && (
              <p className="text-xs text-muted-foreground">Dernières du marché crypto</p>
            )}
          </div>
        </div>
        {compact && onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="group flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/10"
          >
            Tout voir
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {isLoading && <NewsSkeleton rows={compact ? 3 : 5} />}

      {!isLoading && error && (
        <p className="text-sm text-muted-foreground">{error}</p>
      )}

      {!isLoading && !error && displayed.length === 0 && (
        <p className="text-sm text-muted-foreground">Aucune actualité disponible.</p>
      )}

      {!isLoading && !error && displayed.length > 0 && (
        <ul className="space-y-0">
          {displayed.map((article, index) => (
            <li
              key={article.link}
              className={cn(
                "group border-b border-border/40 py-3.5 last:border-0",
                index === 0 && "pt-0",
              )}
            >
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <p className="font-medium leading-snug text-foreground transition-colors group-hover:text-blue-400">
                  {article.title}
                </p>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  {article.pubDate && <span>{timeAgo(article.pubDate)}</span>}
                </div>
                {!compact && article.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground/80">
                    {article.excerpt}
                  </p>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
