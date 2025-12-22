import { Follow, IFollow } from '../models/Follow.model';
import { User } from '@modules/auth/models/User.model';
import { NotFoundError, BadRequestError, ConflictError } from '@shared/utils/errors';
import { FollowQueryParams } from '../types/follows.types';
import { notificationsService } from '@modules/notifications/services/notifications.service';
import mongoose from 'mongoose';

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

    // Create notification for follow
    notificationsService
      .createNotification({
        userId: followingId,
        type: 'follow',
        referenceId: followerId,
        referenceType: 'user',
      })
      .catch((error) => {
        // Silently fail - don't block the follow creation
        console.error('Failed to create follow notification:', error);
      });

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

  async getFollowers(params: FollowQueryParams, currentUserId?: string) {
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

    // Get follow status for current user
    let followStatusMap = new Map<string, boolean>();
    if (currentUserId) {
      const followerIds = followers
        .map((f) => {
          const follower = f.follower as any;
          return follower?._id?.toString();
        })
        .filter((id) => id);

      if (followerIds.length > 0) {
        const followRelationships = await Follow.find({
          follower: currentUserId,
          following: { $in: followerIds.map((id) => new mongoose.Types.ObjectId(id)) },
        }).select('following');

        followRelationships.forEach((follow) => {
          followStatusMap.set(follow.following.toString(), true);
        });
      }
    }

    const users = followers.map((f) => {
      const follower = f.follower as any;
      const userId = follower?._id?.toString();
      return {
        ...follower,
        isFollow: currentUserId ? followStatusMap.has(userId) : false,
      };
    });

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getFollowing(params: FollowQueryParams, currentUserId?: string) {
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

    // Get follow status for current user
    let followStatusMap = new Map<string, boolean>();
    if (currentUserId) {
      const followingIds = following
        .map((f) => {
          const followingUser = f.following as any;
          return followingUser?._id?.toString();
        })
        .filter((id) => id);

      if (followingIds.length > 0) {
        const followRelationships = await Follow.find({
          follower: currentUserId,
          following: { $in: followingIds.map((id) => new mongoose.Types.ObjectId(id)) },
        }).select('following');

        followRelationships.forEach((follow) => {
          followStatusMap.set(follow.following.toString(), true);
        });
      }
    }

    const users = following.map((f) => {
      const followingUser = f.following as any;
      const userId = followingUser?._id?.toString();
      return {
        ...followingUser,
        isFollow: currentUserId ? followStatusMap.has(userId) : false,
      };
    });

    return {
      users,
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

