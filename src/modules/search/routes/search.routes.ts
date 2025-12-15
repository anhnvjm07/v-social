import { Router } from "express";
import { searchController } from "../controllers/search.controller";
import { validate } from "@shared/middleware/validation.middleware";
import { optionalAuthenticate } from "@shared/middleware/auth.middleware";
import { searchSchema } from "../validators/search.validator";

const router = Router();

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search for users, posts, and hashtags
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [users, posts, hashtags, all]
 *           default: all
 *         description: Type of search (users, posts, hashtags, or all)
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
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by (relevance, date, name, etc.)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: JSON string with filters (dateFrom, dateTo, userId)
 *     responses:
 *       200:
 *         description: Search results
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
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                     posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                     hashtags:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tag:
 *                             type: string
 *                           count:
 *                             type: number
 *                           posts:
 *                             type: array
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     total:
 *                       type: number
 *                     pages:
 *                       type: number
 */
router.get(
  "/",
  optionalAuthenticate,
  validate(searchSchema),
  searchController.search.bind(searchController)
);

export default router;

