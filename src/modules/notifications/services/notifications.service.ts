import {
  Notification,
  INotification,
  NotificationType,
  ReferenceType,
} from '../models/Notification.model';
import { User } from '@modules/auth/models/User.model';
import { NotFoundError } from '@shared/utils/errors';
import { CreateNotificationDto, NotificationQueryParams } from '../types/notifications.types';

class NotificationsService {
  async createNotification(data: CreateNotificationDto): Promise<INotification> {
    // Verify user exists
    const user = await User.findById(data.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const notification = new Notification({
      user: data.userId,
      type: data.type,
      referenceId: data.referenceId,
      referenceType: data.referenceType,
      message: data.message || this.generateDefaultMessage(data.type),
    });

    await notification.save();
    await notification.populate('user', 'firstName lastName username avatar');

    return notification;
  }

  async getNotifications(userId: string, params: NotificationQueryParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = { user: userId };

    if (params.unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments(query);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.user.toString() !== userId) {
      throw new NotFoundError('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { user: userId, isRead: false },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({
      user: userId,
      isRead: false,
    });
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.user.toString() !== userId) {
      throw new NotFoundError('Notification not found');
    }

    await Notification.findByIdAndDelete(notificationId);
  }

  private generateDefaultMessage(type: NotificationType): string {
    const messages: Record<NotificationType, string> = {
      like: 'liked your post',
      comment: 'commented on your post',
      follow: 'started following you',
      message: 'sent you a message',
      mention: 'mentioned you',
      reply: 'replied to your comment',
    };

    return messages[type] || 'You have a new notification';
  }
}

export const notificationsService = new NotificationsService();

