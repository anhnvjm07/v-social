import { Router } from "express";
import { usersController } from "../controllers/users.controller";
import { validate } from "@shared/middleware/validation.middleware";
import { authenticate, optionalAuthenticate } from "@shared/middleware/auth.middleware";
import { uploadSingle } from "@shared/middleware/upload.middleware";
import {
  getUserProfileSchema,
  updateProfileSchema,
} from "../validators/users.validator";

const router = Router();

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update my profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 maxLength: 50
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 pattern: "^[a-zA-Z0-9]+$"
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     username:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     isEmailVerified:
 *                       type: boolean
 *                     stats:
 *                       type: object
 *                       properties:
 *                         postsCount:
 *                           type: number
 *                         followersCount:
 *                           type: number
 *                         followingCount:
 *                           type: number
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Username already taken
 *       404:
 *         description: User not found
 */
router.put(
  "/me",
  authenticate,
  uploadSingle("avatar"),
  validate(updateProfileSchema),
  usersController.updateProfile.bind(usersController)
);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile with stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     username:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     isEmailVerified:
 *                       type: boolean
 *                     stats:
 *                       type: object
 *                       properties:
 *                         postsCount:
 *                           type: number
 *                         followersCount:
 *                           type: number
 *                         followingCount:
 *                           type: number
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: User not found
 */
router.get(
  "/:userId",
  optionalAuthenticate,
  validate(getUserProfileSchema),
  usersController.getUserProfile.bind(usersController)
);

export default router;

