import { User, IUser } from '../models/User.model';
import { jwtService, TokenPayload } from '@shared/config/jwt';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '@shared/utils/errors';
import { RegisterDto, LoginDto, RefreshTokenDto, AuthResponse, ProfileResponse } from '../types/auth.types';
import { Post } from '@modules/posts/models/Post.model';
import { Follow } from '@modules/follows/models/Follow.model';

class AuthService {
  async register(data: RegisterDto): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new ConflictError('Email already registered');
      }
      if (existingUser.username === data.username) {
        throw new ConflictError('Username already taken');
      }
    }

    // Generate username if not provided
    let username = data.username;
    if (!username) {
      username = await this.generateUniqueUsername(data.firstName, data.lastName);
    }

    // Create user
    const user = new User({
      ...data,
      username,
    });

    await user.save();

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
    };

    const tokens = jwtService.generateTokenPair(tokenPayload);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        avatar: user.avatar,
      },
      tokens,
    };
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const user = await User.findOne({ email: data.email }).select('+password');

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
    };

    const tokens = jwtService.generateTokenPair(tokenPayload);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        avatar: user.avatar,
      },
      tokens,
    };
  }

  async refreshToken(data: RefreshTokenDto): Promise<{ accessToken: string }> {
    try {
      const payload = jwtService.verifyRefreshToken(data.refreshToken);

      const user = await User.findById(payload.userId).select('+refreshToken');

      if (!user || user.refreshToken !== data.refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const tokenPayload: TokenPayload = {
        userId: user._id.toString(),
        email: user.email,
      };

      const accessToken = jwtService.generateAccessToken(tokenPayload);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

  async getProfile(userId: string): Promise<ProfileResponse> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get stats in parallel
    const [postsCount, followersCount, followingCount] = await Promise.all([
      Post.countDocuments({ author: userId }),
      Follow.countDocuments({ following: userId }),
      Follow.countDocuments({ follower: userId }),
    ]);

    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      isEmailVerified: user.isEmailVerified,
      stats: {
        postsCount,
        followersCount,
        followingCount,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async generateUniqueUsername(firstName: string, lastName: string): Promise<string> {
    const baseUsername = `${firstName}${lastName}`.toLowerCase().replace(/\s+/g, '');
    let username = baseUsername;
    let counter = 1;

    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  }
}

export const authService = new AuthService();

