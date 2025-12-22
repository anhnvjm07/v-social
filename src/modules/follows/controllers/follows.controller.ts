import { Request, Response, NextFunction } from "express";
import { followsService } from "../services/follows.service";
import { FollowQueryParams } from "../types/follows.types";

class FollowsController {
  async followUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { userId } = req.params;

      const follow = await followsService.followUser(req.user.id, userId);

      res.status(201).json({
        success: true,
        data: follow,
      });
    } catch (error) {
      next(error);
    }
  }

  async unfollowUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { userId } = req.params;

      await followsService.unfollowUser(req.user.id, userId);

      res.status(200).json({
        success: true,
        message: "Unfollowed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getFollows(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const type = (req.query.type as "followers" | "following") || "followers";
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      const currentUserId = req.user?.id;

      const params: FollowQueryParams = {
        userId,
        type,
        page,
        limit,
      };

      const result =
        type === "followers"
          ? await followsService.getFollowers(params, currentUserId)
          : await followsService.getFollowing(params, currentUserId);

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkFollowStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { userId } = req.params;

      const isFollowing = await followsService.checkFollowStatus(
        req.user.id,
        userId
      );

      res.status(200).json({
        success: true,
        data: { isFollowing },
      });
    } catch (error) {
      next(error);
    }
  }

  async getFollowStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;

      const stats = await followsService.getFollowStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const followsController = new FollowsController();
