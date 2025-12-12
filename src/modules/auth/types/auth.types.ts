export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username?: string;
    avatar?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface ProfileResponse {
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
