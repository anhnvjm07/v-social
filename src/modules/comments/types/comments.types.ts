export interface CreateCommentDto {
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentDto {
  content: string;
}

export interface CommentQueryParams {
  page?: number;
  limit?: number;
  postId: string;
}

