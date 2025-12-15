import { Message, IMessage } from '../models/Message.model';
import { User } from '@modules/auth/models/User.model';
import { NotFoundError, BadRequestError } from '@shared/utils/errors';
import { SendMessageDto, MessageQueryParams } from '../types/messages.types';
import { notificationsService } from '@modules/notifications/services/notifications.service';
import mongoose from 'mongoose';

class MessagesService {
  async sendMessage(senderId: string, data: SendMessageDto): Promise<IMessage> {
    if (senderId === data.receiverId) {
      throw new BadRequestError('Cannot send message to yourself');
    }

    // Verify receiver exists
    const receiver = await User.findById(data.receiverId);
    if (!receiver) {
      throw new NotFoundError('Receiver not found');
    }

    const message = new Message({
      sender: senderId,
      receiver: data.receiverId,
      content: data.content,
    });

    await message.save();
    await message.populate('sender', 'firstName lastName username avatar');
    await message.populate('receiver', 'firstName lastName username avatar');

    // Create notification for message
    notificationsService
      .createNotification({
        userId: data.receiverId,
        type: 'message',
        referenceId: message._id.toString(),
        referenceType: 'message',
      })
      .catch((error) => {
        // Silently fail - don't block the message creation
        console.error('Failed to create message notification:', error);
      });

    return message;
  }

  async getConversations(userId: string, params: MessageQueryParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    // Get distinct conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: new mongoose.Types.ObjectId(userId) }, { receiver: new mongoose.Types.ObjectId(userId) }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          user: {
            _id: '$user._id',
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            username: '$user.username',
            avatar: '$user.avatar',
          },
          lastMessage: 1,
          unreadCount: 1,
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    const total = await Message.distinct('sender', {
      $or: [{ sender: new mongoose.Types.ObjectId(userId) }, { receiver: new mongoose.Types.ObjectId(userId) }],
    }).then((senders) => {
      return Message.distinct('receiver', {
        $or: [{ sender: new mongoose.Types.ObjectId(userId) }, { receiver: new mongoose.Types.ObjectId(userId) }],
      }).then((receivers) => {
        const allUsers = [...new Set([...senders, ...receivers].map((id) => id.toString()))];
        return allUsers.filter((id) => id !== userId).length;
      });
    });

    return {
      conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getMessages(userId: string, otherUserId: string, params: MessageQueryParams) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .populate('sender', 'firstName lastName username avatar')
      .populate('receiver', 'firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    const total = await Message.countDocuments({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    });

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(messageId: string, userId: string): Promise<void> {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.receiver.toString() !== userId) {
      throw new BadRequestError('You can only mark your own received messages as read');
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Message.countDocuments({
      receiver: userId,
      isRead: false,
    });
  }
}

export const messagesService = new MessagesService();

