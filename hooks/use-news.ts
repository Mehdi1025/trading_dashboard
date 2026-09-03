"use client";

import { useCallback, useEffect, useState } from "react";
import type { NewsArticle } from "@/types/news";

export function useNews(limit = 6) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/news?limit=${limit}`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des actualités.");
      }

      const data = (await response.json()) as NewsArticle[];
      setArticles(data);
    } catch {
      setError("Impossible de charger les actualités pour le moment.");
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void fetchNews();
  }, [fetchNews]);

  return { articles, isLoading, error, refetch: fetchNews };
}
