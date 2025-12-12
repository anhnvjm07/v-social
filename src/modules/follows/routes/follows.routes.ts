import { Router } from 'express';
import { followsController } from '../controllers/follows.controller';
import { validate } from '@shared/middleware/validation.middleware';
import { authenticate, optionalAuthenticate } from '@shared/middleware/auth.middleware';
import {
  followUserSchema,
  unfollowUserSchema,
  getFollowsSchema,
  checkFollowStatusSchema,
} from '../validators/follows.validator';

const router = Router();

/**
 * @swagger
 * /api/follows/{userId}:
 *   post:
 *     summary: Follow a user
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Successfully followed user
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Already following this user
 *       404:
 *         description: User not found
 */
router.post(
  '/:userId',
  authenticate,
  validate(followUserSchema),
  followsController.followUser.bind(followsController)
);

/**
 * @swagger
 * /api/follows/{userId}:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully unfollowed user
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not following this user
 */
router.delete(
  '/:userId',
  authenticate,
  validate(unfollowUserSchema),
  followsController.unfollowUser.bind(followsController)
);

/**
 * @swagger
 * /api/follows/{userId}:
 *   get:
 *     summary: Get followers or following list
 *     tags: [Follows]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [followers, following]
 *           default: followers
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of followers or following
 */
router.get(
  '/:userId',
  validate(getFollowsSchema),
  followsController.getFollows.bind(followsController)
);

/**
 * @swagger
 * /api/follows/{userId}/check:
 *   get:
 *     summary: Check if current user is following a user
 *     tags: [Follows]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Follow status
 */
router.get(
  '/:userId/check',
  optionalAuthenticate,
  validate(checkFollowStatusSchema),
  followsController.checkFollowStatus.bind(followsController)
);

/**
 * @swagger
 * /api/follows/{userId}/stats:
 *   get:
 *     summary: Get follow statistics for a user
 *     tags: [Follows]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Follow statistics (followers count, following count)
 */
router.get(
  '/:userId/stats',
  validate(checkFollowStatusSchema),
  followsController.getFollowStats.bind(followsController)
);

export default router;

