export interface ArticleAuthor {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}

export interface ArticleSummary {
  id: string;
  slug: string;
  title?: string | null;
  summary?: string | null;
  contentHtml?: string | null;
  tags?: string[] | null;
  createdAt?: string | Date | null;
  isPublished?: boolean | null;
  author?: ArticleAuthor | null;
}
