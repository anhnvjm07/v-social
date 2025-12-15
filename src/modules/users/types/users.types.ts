export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  avatar?: string;
  bio?: string;
  isEmailVerified: boolean;
  stats: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
}

