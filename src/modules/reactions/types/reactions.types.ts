export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export interface CreateReactionDto {
  type: ReactionType;
}

export interface ReactionQueryParams {
  page?: number;
  limit?: number;
  targetId: string;
  targetType: 'post' | 'comment';
}

