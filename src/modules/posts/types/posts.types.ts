export interface CreatePostDto {
  content: string;
  media?: string[];
}

export interface UpdatePostDto {
  content?: string;
  media?: string[];
}

export interface PostQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
}

