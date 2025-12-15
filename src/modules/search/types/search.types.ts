export type SearchType = "users" | "posts" | "hashtags" | "all";

export interface SearchQueryParams {
  q: string;
  type?: SearchType;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
  };
}

export interface SearchResult {
  users?: any[];
  posts?: any[];
  hashtags?: Array<{
    tag: string;
    count: number;
    posts: any[];
  }>;
}

export interface SearchResponse {
  results: SearchResult;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

