import { Reaction, IReaction, ReactionType, ReactionTargetType } from '../models/Reaction.model';
import { Post } from '@modules/posts/models/Post.model';
import { Comment } from '@modules/comments/models/Comment.model';
import { NotFoundError, ConflictError } from '@shared/utils/errors';
import { CreateReactionDto, ReactionQueryParams } from '../types/reactions.types';
import mongoose from 'mongoose';

class ReactionsService {
  async toggleReaction(
    userId: string,
    targetId: string,
    targetType: ReactionTargetType,
    data: CreateReactionDto
  ): Promise<{ reaction: IReaction | null; action: 'created' | 'updated' | 'deleted' }> {
    // Verify target exists
    if (targetType === 'post') {
      const post = await Post.findById(targetId);
      if (!post) {
        throw new NotFoundError('Post not found');
      }
    } else {
      const comment = await Comment.findById(targetId);
      if (!comment) {
        throw new NotFoundError('Comment not found');
      }
    }

    // Check if reaction exists
    const existingReaction = await Reaction.findOne({
      user: userId,
      targetType,
      target: targetId,
    });

    if (existingReaction) {
      if (existingReaction.type === data.type) {
        // Same reaction type - remove it
        await Reaction.findByIdAndDelete(existingReaction._id);
        await this.updateTargetReactionCount(targetId, targetType, -1);
        return { reaction: null, action: 'deleted' };
      } else {
        // Different reaction type - update it
        existingReaction.type = data.type;
        await existingReaction.save();
        return { reaction: existingReaction, action: 'updated' };
      }
    } else {
      // Create new reaction
      const reaction = new Reaction({
        user: userId,
        targetType,
        target: targetId,
        type: data.type,
      });

      await reaction.save();
      await this.updateTargetReactionCount(targetId, targetType, 1);

      return { reaction, action: 'created' };
    }
  }

  async getReactions(params: ReactionQueryParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const reactions = await Reaction.find({
      targetType: params.targetType,
      target: params.targetId,
    })
      .populate('user', 'firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Reaction.countDocuments({
      targetType: params.targetType,
      target: params.targetId,
    });

    // Group by type
    const groupedReactions = await Reaction.aggregate([
      {
        $match: {
          targetType: params.targetType,
          target: new mongoose.Types.ObjectId(params.targetId),
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      reactions,
      summary: groupedReactions.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserReaction(
    userId: string,
    targetId: string,
    targetType: ReactionTargetType
  ): Promise<IReaction | null> {
    return Reaction.findOne({
      user: userId,
      targetType,
      target: targetId,
    });
  }

  private async updateTargetReactionCount(
    targetId: string,
    targetType: ReactionTargetType,
    increment: number
  ): Promise<void> {
    if (targetType === 'post') {
      await Post.findByIdAndUpdate(targetId, { $inc: { likesCount: increment } });
    } else {
      await Comment.findByIdAndUpdate(targetId, { $inc: { likesCount: increment } });
    }
  }
}

export const reactionsService = new ReactionsService();

