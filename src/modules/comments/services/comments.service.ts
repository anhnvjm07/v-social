import { Comment, IComment } from '../models/Comment.model';
import { Post } from '@modules/posts/models/Post.model';
import { NotFoundError, ForbiddenError, BadRequestError } from '@shared/utils/errors';
import { CreateCommentDto, UpdateCommentDto, CommentQueryParams } from '../types/comments.types';
import { postsService } from '@modules/posts/services/posts.service';

class CommentsService {
  async createComment(
    postId: string,
    userId: string,
    data: CreateCommentDto
  ): Promise<IComment> {
    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // If parent comment exists, verify it
    if (data.parentCommentId) {
      const parentComment = await Comment.findById(data.parentCommentId);
      if (!parentComment) {
        throw new NotFoundError('Parent comment not found');
      }
      if (parentComment.post.toString() !== postId) {
        throw new BadRequestError('Parent comment does not belong to this post');
      }
    }

    const comment = new Comment({
      post: postId,
      author: userId,
      content: data.content,
      parentComment: data.parentCommentId || null,
    });

    await comment.save();
    await comment.populate('author', 'firstName lastName username avatar');

    // Increment comments count on post
    await postsService.incrementCommentsCount(postId);

    // If it's a reply, increment replies count on parent comment
    if (data.parentCommentId) {
      await Comment.findByIdAndUpdate(data.parentCommentId, {
        $inc: { repliesCount: 1 },
      });
    }

    return comment;
  }

  async getComments(params: CommentQueryParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {
      post: params.postId,
      parentComment: null, // Only top-level comments
    };

    const comments = await Comment.find(query)
      .populate('author', 'firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get replies for each comment (limit to 3 most recent)
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('author', 'firstName lastName username avatar')
          .sort({ createdAt: -1 })
          .limit(3)
          .lean();

        return {
          ...comment,
          replies,
        };
      })
    );

    const total = await Comment.countDocuments(query);

    return {
      comments: commentsWithReplies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCommentReplies(commentId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const replies = await Comment.find({ parentComment: commentId })
      .populate('author', 'firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Comment.countDocuments({ parentComment: commentId });

    return {
      replies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateComment(commentId: string, userId: string, data: UpdateCommentDto): Promise<IComment> {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.author.toString() !== userId) {
      throw new ForbiddenError('You can only update your own comments');
    }

    comment.content = data.content;
    await comment.save();
    await comment.populate('author', 'firstName lastName username avatar');

    return comment;
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.author.toString() !== userId) {
      throw new ForbiddenError('You can only delete your own comments');
    }

    const postId = comment.post.toString();
    const parentCommentId = comment.parentComment?.toString();

    // Delete all replies
    await Comment.deleteMany({ parentComment: commentId });

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // Decrement comments count on post
    await postsService.decrementCommentsCount(postId);

    // If it was a reply, decrement replies count on parent
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { repliesCount: -1 },
      });
    }
  }
}

export const commentsService = new CommentsService();

