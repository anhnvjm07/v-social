import Joi from 'joi';

export const followUserSchema = Joi.object({
  params: Joi.object({
    userId: Joi.string().required(),
  }),
});

export const unfollowUserSchema = Joi.object({
  params: Joi.object({
    userId: Joi.string().required(),
  }),
});

export const getFollowsSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    type: Joi.string().valid('followers', 'following').optional(),
  }),
  params: Joi.object({
    userId: Joi.string().required(),
  }),
});

export const checkFollowStatusSchema = Joi.object({
  params: Joi.object({
    userId: Joi.string().required(),
  }),
});

