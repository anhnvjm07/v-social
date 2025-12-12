import { Router } from 'express';
import { commentsController } from '../controllers/comments.controller';
import { validate } from '@shared/middleware/validation.middleware';
import { authenticate } from '@shared/middleware/auth.middleware';
import {
  createCommentSchema,
  updateCommentSchema,
  getCommentsSchema,
  getCommentRepliesSchema,
  deleteCommentSchema,
} from '../validators/comments.validator';

const router = Router();

/**
 * @swagger
 * /api/comments/posts/{postId}:
 *   post:
 *     summary: Create a comment on a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *               parentCommentId:
 *                 type: string
 *                 description: ID of parent comment for nested comments
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.post(
  '/posts/:postId',
  authenticate,
  validate(createCommentSchema),
  commentsController.createComment.bind(commentsController)
);

/**
 * @swagger
 * /api/comments/posts/{postId}:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
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
 *         description: List of comments
 */
router.get(
  '/posts/:postId',
  validate(getCommentsSchema),
  commentsController.getComments.bind(commentsController)
);

/**
 * @swagger
 * /api/comments/{id}/replies:
 *   get:
 *     summary: Get replies to a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: List of replies
 */
router.get(
  '/:id/replies',
  validate(getCommentRepliesSchema),
  commentsController.getCommentReplies.bind(commentsController)
);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the comment owner
 *       404:
 *         description: Comment not found
 */
router.put(
  '/:id',
  authenticate,
  validate(updateCommentSchema),
  commentsController.updateComment.bind(commentsController)
);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the comment owner
 *       404:
 *         description: Comment not found
 */
router.delete(
  '/:id',
  authenticate,
  validate(deleteCommentSchema),
  commentsController.deleteComment.bind(commentsController)
);

export default router;

