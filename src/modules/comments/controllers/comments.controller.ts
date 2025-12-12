import { Request, Response, NextFunction } from 'express';
import { commentsService } from '../services/comments.service';
import { CreateCommentDto, UpdateCommentDto } from '../types/comments.types';

class CommentsController {
  async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { postId } = req.params;
      const data: CreateCommentDto = req.body;

      const comment = await commentsService.createComment(postId, req.user.id, data);

      res.status(201).json({
        success: true,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { postId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const result = await commentsService.getComments({ postId, page, limit });

      res.status(200).json({
        success: true,
        data: result.comments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCommentReplies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await commentsService.getCommentReplies(id, page, limit);

      res.status(200).json({
        success: true,
        data: result.replies,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const data: UpdateCommentDto = req.body;

      const comment = await commentsService.updateComment(id, req.user.id, data);

      res.status(200).json({
        success: true,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;

      await commentsService.deleteComment(id, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const commentsController = new CommentsController();

