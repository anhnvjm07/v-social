import Joi from 'joi';

export const sendMessageSchema = Joi.object({
  body: Joi.object({
    content: Joi.string().trim().min(1).max(2000).required(),
    receiverId: Joi.string().required(),
  }),
});

export const getConversationsSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
});

export const getMessagesSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
  params: Joi.object({
    userId: Joi.string().required(),
  }),
});

export const markAsReadSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

