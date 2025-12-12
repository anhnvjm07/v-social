import Joi from 'joi';

export const toggleReactionSchema = Joi.object({
  body: Joi.object({
    type: Joi.string().valid('like', 'love', 'haha', 'wow', 'sad', 'angry').required(),
  }),
  params: Joi.object({
    targetId: Joi.string().required(),
    targetType: Joi.string().valid('post', 'comment').required(),
  }),
});

export const getReactionsSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
  params: Joi.object({
    targetId: Joi.string().required(),
    targetType: Joi.string().valid('post', 'comment').required(),
  }),
});

export const getUserReactionSchema = Joi.object({
  params: Joi.object({
    targetId: Joi.string().required(),
    targetType: Joi.string().valid('post', 'comment').required(),
  }),
});

