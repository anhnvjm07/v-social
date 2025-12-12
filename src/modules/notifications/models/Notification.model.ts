import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'message'
  | 'mention'
  | 'reply';

export type ReferenceType = 'post' | 'comment' | 'user' | 'message';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  referenceId?: mongoose.Types.ObjectId;
  referenceType?: ReferenceType;
  message: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'message', 'mention', 'reply'],
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    referenceType: {
      type: String,
      enum: ['post', 'comment', 'user', 'message'],
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification: Model<INotification> = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);

