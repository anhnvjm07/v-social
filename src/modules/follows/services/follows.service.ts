import { Follow, IFollow } from '../models/Follow.model';
import { User } from '@modules/auth/models/User.model';
import { NotFoundError, BadRequestError, ConflictError } from '@shared/utils/errors';
import { FollowQueryParams } from '../types/follows.types';

class FollowsService {
  async followUser(followerId: string, followingId: string): Promise<IFollow> {
    if (followerId === followingId) {
      throw new BadRequestError('Cannot follow yourself');
    }

    // Verify user exists
    const user = await User.findById(followingId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    if (existingFollow) {
      throw new ConflictError('Already following this user');
    }

    const follow = new Follow({
      follower: followerId,
      following: followingId,
    });

    await follow.save();
    await follow.populate('follower', 'firstName lastName username avatar');
    await follow.populate('following', 'firstName lastName username avatar');

    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const follow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    if (!follow) {
      throw new NotFoundError('Not following this user');
    }

    await Follow.findByIdAndDelete(follow._id);
  }

  async getFollowers(params: FollowQueryParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const followers = await Follow.find({ following: params.userId })
      .populate('follower', 'firstName lastName username avatar bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Follow.countDocuments({ following: params.userId });

    return {
      users: followers.map((f) => f.follower),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getFollowing(params: FollowQueryParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const following = await Follow.find({ follower: params.userId })
      .populate('following', 'firstName lastName username avatar bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Follow.countDocuments({ follower: params.userId });

    return {
      users: following.map((f) => f.following),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async checkFollowStatus(followerId: string, followingId: string): Promise<boolean> {
    const follow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    return !!follow;
  }

  async getFollowStats(userId: string) {
    const followersCount = await Follow.countDocuments({ following: userId });
    const followingCount = await Follow.countDocuments({ follower: userId });

    return {
      followers: followersCount,
      following: followingCount,
    };
  }
}

export const followsService = new FollowsService();

