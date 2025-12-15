import { Request, Response, NextFunction } from 'express';
import { postsService } from '../services/posts.service';
import { CreatePostDto, UpdatePostDto } from '../types/posts.types';

class PostsController {
  async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const data: CreatePostDto = req.body;
      const files = req.files as Express.Multer.File[] | undefined;

      const post = await postsService.createPost(req.user.id, data, files);

      res.status(201).json({
        success: true,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const post = await postsService.getPostById(id, userId);

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        userId: req.query.userId as string | undefined,
      };

      const result = await postsService.getPosts(queryParams, req.user?.id);

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const queryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        userId: req.user.id, // Use current user's ID
      };

      const result = await postsService.getPosts(queryParams, req.user.id);

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const data: UpdatePostDto = req.body;

      const post = await postsService.updatePost(id, req.user.id, data);

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;

      await postsService.deletePost(id, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const postsController = new PostsController();

