import { Router } from 'express';
import { messagesController } from '../controllers/messages.controller';
import { validate } from '@shared/middleware/validation.middleware';
import { authenticate } from '@shared/middleware/auth.middleware';
import {
  sendMessageSchema,
  getConversationsSchema,
  getMessagesSchema,
  markAsReadSchema,
} from '../validators/messages.validator';

const router = Router();

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message to a user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - receiverId
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 2000
 *               receiverId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Receiver not found
 */
router.post(
  '/',
  authenticate,
  validate(sendMessageSchema),
  messagesController.sendMessage.bind(messagesController)
);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get list of conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
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
 *           default: 20
 *     responses:
 *       200:
 *         description: List of conversations with last message and unread count
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/conversations',
  authenticate,
  validate(getConversationsSchema),
  messagesController.getConversations.bind(messagesController)
);

/**
 * @swagger
 * /api/messages/{userId}:
 *   get:
 *     summary: Get messages with a specific user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *           default: 50
 *     responses:
 *       200:
 *         description: List of messages
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:userId',
  authenticate,
  validate(getMessagesSchema),
  messagesController.getMessages.bind(messagesController)
);

/**
 * @swagger
 * /api/messages/{id}/read:
 *   put:
 *     summary: Mark a message as read
 *     tags: [Messages]
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
 *         description: Message marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message not found
 */
router.put(
  '/:id/read',
  authenticate,
  validate(markAsReadSchema),
  messagesController.markAsRead.bind(messagesController)
);

/**
 * @swagger
 * /api/messages/unread/count:
 *   get:
 *     summary: Get count of unread messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread messages count
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/unread/count',
  authenticate,
  messagesController.getUnreadCount.bind(messagesController)
);

export default router;

