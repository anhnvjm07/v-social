import Joi from 'joi';

export const getNotificationsSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    unreadOnly: Joi.boolean().optional(),
  }),
});

export const markAsReadSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

export const deleteNotificationSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

