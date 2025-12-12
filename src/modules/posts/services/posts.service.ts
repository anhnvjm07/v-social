import { Post, IPost } from '../models/Post.model';
import { User } from '@modules/auth/models/User.model';
import { cloudinaryService, UploadResult } from '@shared/config/cloudinary';
import { NotFoundError, ForbiddenError, BadRequestError } from '@shared/utils/errors';
import { CreatePostDto, UpdatePostDto, PostQueryParams } from '../types/posts.types';
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
    });

    await post.save();
    await post.populate('author', 'firstName lastName username avatar');

    return post;
  }

  async getPostById(postId: string, userId?: string): Promise<IPost> {
    const post = await Post.findById(postId).populate('author', 'firstName lastName username avatar');

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    return post;
  }

  async getPosts(params: PostQueryParams, userId?: string) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (params.userId) {
      query.author = params.userId;
    }

    const posts = await Post.find(query)
      .populate('author', 'firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(query);

    return {
      posts,
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
}

export const postsService = new PostsService();

