export type NewsArticle = {
  title: string;
  link: string;
  pubDate: string;
  excerpt: string;
};

export type NewsCategory = "all" | "bitcoin" | "ethereum" | "marche" | "regulation" | "defi";
