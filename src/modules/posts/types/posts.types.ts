export type PostVisibility = "public" | "private" | "followers";

export interface CreatePostDto {
  content: string;
  media?: string[];
  visibility?: PostVisibility;
}

export interface UpdatePostDto {
  content?: string;
  media?: string[];
  visibility?: PostVisibility;
}

export interface PostQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
}

