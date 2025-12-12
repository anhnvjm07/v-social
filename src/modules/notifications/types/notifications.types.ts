export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'message'
  | 'mention'
  | 'reply';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  referenceId?: string;
  referenceType?: 'post' | 'comment' | 'user' | 'message';
  message?: string;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

