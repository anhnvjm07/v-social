import { Router } from 'express';
import { reactionsController } from '../controllers/reactions.controller';
import { validate } from '@shared/middleware/validation.middleware';
import { authenticate, optionalAuthenticate } from '@shared/middleware/auth.middleware';
import {
  toggleReactionSchema,
  getReactionsSchema,
  getUserReactionSchema,
} from '../validators/reactions.validator';

const router = Router();

/**
 * @swagger
 * /api/reactions/{targetType}/{targetId}:
 *   post:
 *     summary: Toggle reaction on a post or comment
 *     tags: [Reactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [post, comment]
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [like, love, haha, wow, sad, angry]
 *     responses:
 *       200:
 *         description: Reaction toggled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post or comment not found
 */
router.post(
  '/:targetType/:targetId',
  authenticate,
  validate(toggleReactionSchema),
  reactionsController.toggleReaction.bind(reactionsController)
);

/**
 * @swagger
 * /api/reactions/{targetType}/{targetId}:
 *   get:
 *     summary: Get reactions for a post or comment
 *     tags: [Reactions]
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [post, comment]
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: List of reactions with summary
 */
router.get(
  '/:targetType/:targetId',
  validate(getReactionsSchema),
  reactionsController.getReactions.bind(reactionsController)
);

/**
 * @swagger
 * /api/reactions/{targetType}/{targetId}/user:
 *   get:
 *     summary: Get current user's reaction on a post or comment
 *     tags: [Reactions]
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [post, comment]
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's reaction or null if no reaction
 */
router.get(
  '/:targetType/:targetId/user',
  optionalAuthenticate,
  validate(getUserReactionSchema),
  reactionsController.getUserReaction.bind(reactionsController)
);

export default router;

