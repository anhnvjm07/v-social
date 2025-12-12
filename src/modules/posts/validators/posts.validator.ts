import Joi from 'joi';

export const createPostSchema = Joi.object({
  body: Joi.object({
    content: Joi.string().trim().min(1).max(2000).required(),
    media: Joi.array().items(Joi.string().uri()).optional(),
  }),
});

export const updatePostSchema = Joi.object({
  body: Joi.object({
    content: Joi.string().trim().min(1).max(2000).optional(),
    media: Joi.array().items(Joi.string().uri()).optional(),
  }),
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

export const getPostsSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    userId: Joi.string().optional(),
  }),
});

export const getPostSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

export const deletePostSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

