import { Router } from 'express';
import { notificationsController } from '../controllers/notifications.controller';
import { validate } from '@shared/middleware/validation.middleware';
import { authenticate } from '@shared/middleware/auth.middleware';
import {
  getNotificationsSchema,
  markAsReadSchema,
  deleteNotificationSchema,
} from '../validators/notifications.validator';

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
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
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authenticate,
  validate(getNotificationsSchema),
  notificationsController.getNotifications.bind(notificationsController)
);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
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
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.put(
  '/:id/read',
  authenticate,
  validate(markAsReadSchema),
  notificationsController.markAsRead.bind(notificationsController)
);

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/read-all',
  authenticate,
  notificationsController.markAllAsRead.bind(notificationsController)
);

/**
 * @swagger
 * /api/notifications/unread/count:
 *   get:
 *     summary: Get count of unread notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notifications count
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/unread/count',
  authenticate,
  notificationsController.getUnreadCount.bind(notificationsController)
);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
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
 *         description: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.delete(
  '/:id',
  authenticate,
  validate(deleteNotificationSchema),
  notificationsController.deleteNotification.bind(notificationsController)
);

export default router;

