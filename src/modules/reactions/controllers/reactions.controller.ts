import { Request, Response, NextFunction } from 'express';
import { reactionsService } from '../services/reactions.service';
import { CreateReactionDto, ReactionQueryParams } from '../types/reactions.types';

class ReactionsController {
  async toggleReaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { targetId, targetType } = req.params;
      const data: CreateReactionDto = req.body;

      const result = await reactionsService.toggleReaction(
        req.user.id,
        targetId,
        targetType as 'post' | 'comment',
        data
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { targetId, targetType } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const result = await reactionsService.getReactions({
        targetId,
        targetType: targetType as 'post' | 'comment',
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: result.reactions,
        summary: result.summary,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserReaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { targetId, targetType } = req.params;

      const reaction = await reactionsService.getUserReaction(
        req.user.id,
        targetId,
        targetType as 'post' | 'comment'
      );

      res.status(200).json({
        success: true,
        data: reaction,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reactionsController = new ReactionsController();

