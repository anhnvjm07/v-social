import { Router } from 'express';
import { postsController } from '../controllers/posts.controller';
import { validate } from '@shared/middleware/validation.middleware';
import { authenticate, optionalAuthenticate } from '@shared/middleware/auth.middleware';
import { uploadMultiple } from '@shared/middleware/upload.middleware';
import {
  createPostSchema,
  updatePostSchema,
  getPostsSchema,
  getPostSchema,
  deletePostSchema,
} from '../validators/posts.validator';

const router = Router();

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 2000
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Post created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authenticate,
  uploadMultiple('files', 10),
  validate(createPostSchema),
  postsController.createPost.bind(postsController)
);

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get list of posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter posts by user ID
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get(
  '/',
  optionalAuthenticate,
  validate(getPostsSchema),
  postsController.getPosts.bind(postsController)
);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
router.get(
  '/:id',
  optionalAuthenticate,
  validate(getPostSchema),
  postsController.getPost.bind(postsController)
);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
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
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 2000
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the post owner
 *       404:
 *         description: Post not found
 */
router.put(
  '/:id',
  authenticate,
  validate(updatePostSchema),
  postsController.updatePost.bind(postsController)
);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
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
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the post owner
 *       404:
 *         description: Post not found
 */
router.delete(
  '/:id',
  authenticate,
  validate(deletePostSchema),
  postsController.deletePost.bind(postsController)
);

export default router;

