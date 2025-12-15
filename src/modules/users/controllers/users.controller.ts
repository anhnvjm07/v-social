import { Request, Response, NextFunction } from "express";
import { usersService } from "../services/users.service";
import { UpdateProfileDto } from "../types/users.types";

class UsersController {
  async getUserProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;

      const profile = await usersService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(
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

      const data: UpdateProfileDto = req.body;
      const avatarFile = req.file as Express.Multer.File | undefined;

      const profile = await usersService.updateProfile(
        req.user.id,
        data,
        avatarFile
      );

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();

