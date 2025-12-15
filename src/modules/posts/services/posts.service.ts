import { Post, IPost } from '../models/Post.model';
import { User } from '@modules/auth/models/User.model';
import { cloudinaryService, UploadResult } from '@shared/config/cloudinary';
import { NotFoundError, ForbiddenError, BadRequestError } from '@shared/utils/errors';
import { CreatePostDto, UpdatePostDto, PostQueryParams } from '../types/posts.types';
import { Follow } from '@modules/follows/models/Follow.model';
import { notificationsService } from '@modules/notifications/services/notifications.service';
import { extractMentions, validateMentions } from '@shared/utils/mentions';
import mongoose from 'mongoose';

class PostsService {
  async createPost(userId: string, data: CreatePostDto, files?: Express.Multer.File[]) {
    let media: Array<{ url: string; type: 'image' | 'video'; publicId: string }> = [];

    // Upload media files if provided
    if (files && files.length > 0) {
      const uploadResults: UploadResult[] = await cloudinaryService.uploadMultipleFiles(
        files,
        {
          folder: 'social-media/posts',
          resource_type: 'auto',
        }
      );

      media = uploadResults.map((result) => ({
        url: result.secure_url,
        type: result.resource_type === 'video' ? 'video' : 'image',
        publicId: result.public_id,
      }));
    }

    // If media URLs provided in data, add them
    if (data.media && data.media.length > 0) {
      // Assume these are already uploaded URLs
      const existingMedia = data.media.map((url) => {
        const isVideo = url.match(/\.(mp4|mov|avi|webm)$/i);
        return {
          url,
          type: (isVideo ? 'video' : 'image') as 'image' | 'video',
          publicId: '', // Will need to extract from URL if needed
        };
      });
      media = [...media, ...existingMedia];
    }

    const post = new Post({
      author: userId,
      content: data.content,
      media,
      visibility: data.visibility || 'public',
    });

    await post.save();
    await post.populate('author', 'firstName lastName username avatar');

    // Detect and notify mentioned users
    this.createMentionNotifications(userId, data.content, post._id.toString()).catch((error) => {
      console.error('Failed to create mention notifications:', error);
    });

    return post;
  }

  async getPostById(postId: string, userId?: string): Promise<IPost> {
    const post = await Post.findById(postId).populate('author', 'firstName lastName username avatar');

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Check visibility
    const canView = await this.canViewPost(post, userId);
    if (!canView) {
      throw new NotFoundError('Post not found');
    }

    return post;
  }

  private async canViewPost(
    post: IPost | any,
    userId?: string
  ): Promise<boolean> {
    // Public posts: always visible
    if (post.visibility === 'public') {
      return true;
    }

    // If user not logged in, only public posts are visible
    if (!userId) {
      return false;
    }

    // Get author ID (handle both Mongoose document and plain object)
    const authorId =
      typeof post.author === 'object' && post.author._id
        ? post.author._id.toString()
        : post.author.toString();

    // Private posts: only author can view
    if (post.visibility === 'private') {
      return authorId === userId;
    }

    // Followers posts: author or followers can view
    if (post.visibility === 'followers') {
      // Author can always view their own posts
      if (authorId === userId) {
        return true;
      }

      // Check if user is following the author
      const follow = await Follow.findOne({
        follower: userId,
        following: authorId,
      });

      return !!follow;
    }

    return false;
  }

  async getPosts(params: PostQueryParams, userId?: string) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (params.userId) {
      query.author = params.userId;
    }

    // Build visibility filter
    if (!userId) {
      // Not logged in: only public posts
      query.visibility = 'public';
    } else {
      // Logged in: can see public, own private/followers, and followers posts if following
      const visibilityConditions: any[] = [{ visibility: 'public' }];

      // Own posts (private or followers) are always visible
      visibilityConditions.push({
        $and: [
          { author: new mongoose.Types.ObjectId(userId) },
          { visibility: { $in: ['private', 'followers'] } },
        ],
      });

      // Followers posts: need to check if user is following the author
      // We'll filter this after fetching using canViewPost method
      query.$or = visibilityConditions;
    }

    const posts = await Post.find(query)
      .populate('author', 'firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit * 2) // Fetch more to account for filtering
      .lean();

    // Filter posts based on visibility rules
    const filteredPosts = [];
    for (const post of posts) {
      const canView = await this.canViewPost(post, userId);
      if (canView) {
        filteredPosts.push(post);
        if (filteredPosts.length >= limit) {
          break;
        }
      }
    }

    // Get accurate total count (this is approximate for performance)
    const totalQuery: any = {};
    if (params.userId) {
      totalQuery.author = params.userId;
    }
    if (!userId) {
      totalQuery.visibility = 'public';
    } else {
      totalQuery.$or = [
        { visibility: 'public' },
        {
          $and: [
            { author: new mongoose.Types.ObjectId(userId) },
            { visibility: { $in: ['private', 'followers'] } },
          ],
        },
      ];
    }
    const total = await Post.countDocuments(totalQuery);

    return {
      posts: filteredPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updatePost(postId: string, userId: string, data: UpdatePostDto) {
    const post = await Post.findById(postId);

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.author.toString() !== userId) {
      throw new ForbiddenError('You can only update your own posts');
    }

    if (data.content !== undefined) {
      post.content = data.content;
    }

    if (data.media !== undefined) {
      // Delete old media from Cloudinary
      if (post.media.length > 0) {
        const publicIds = post.media
          .map((m) => m.publicId)
          .filter((id) => id && id.length > 0);
        if (publicIds.length > 0) {
          await cloudinaryService.deleteMultipleFiles(publicIds);
        }
      }

      // Add new media (assuming URLs are provided)
      post.media = data.media.map((url) => {
        const isVideo = url.match(/\.(mp4|mov|avi|webm)$/i);
        return {
          url,
          type: (isVideo ? 'video' : 'image') as 'image' | 'video',
          publicId: '', // Extract from URL if needed
        };
      });
    }

    if (data.visibility !== undefined) {
      post.visibility = data.visibility;
    }

    await post.save();
    await post.populate('author', 'firstName lastName username avatar');

    return post;
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await Post.findById(postId);

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.author.toString() !== userId) {
      throw new ForbiddenError('You can only delete your own posts');
    }

    // Delete media from Cloudinary
    if (post.media.length > 0) {
      const publicIds = post.media
        .map((m) => m.publicId)
        .filter((id) => id && id.length > 0);
      if (publicIds.length > 0) {
        await cloudinaryService.deleteMultipleFiles(publicIds);
      }
    }

    await Post.findByIdAndDelete(postId);
  }

  async incrementCommentsCount(postId: string): Promise<void> {
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
  }

  async decrementCommentsCount(postId: string): Promise<void> {
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -1 } });
  }

  private async createMentionNotifications(
    userId: string,
    content: string,
    postId: string
  ): Promise<void> {
    try {
      const mentionedUsernames = extractMentions(content);
      if (mentionedUsernames.length === 0) {
        return;
      }

      const mentionedUserIds = await validateMentions(mentionedUsernames);

      // Create mention notifications for each mentioned user (excluding the post author)
      const notifications = mentionedUserIds
        .filter((mentionedUserId) => mentionedUserId !== userId)
        .map((mentionedUserId) =>
          notificationsService.createNotification({
            userId: mentionedUserId,
            type: 'mention',
            referenceId: postId,
            referenceType: 'post',
          })
        );

      await Promise.all(notifications);
    } catch (error) {
      // Silently fail - don't block the post creation
      console.error('Error creating mention notifications:', error);
    }
  }
}

export const postsService = new PostsService();

