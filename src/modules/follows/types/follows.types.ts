export interface FollowQueryParams {
  page?: number;
  limit?: number;
  userId: string;
  type?: 'followers' | 'following';
}

