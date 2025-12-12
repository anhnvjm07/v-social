import Joi from 'joi';

export const createCommentSchema = Joi.object({
  body: Joi.object({
    content: Joi.string().trim().min(1).max(1000).required(),
    parentCommentId: Joi.string().optional(),
  }),
  params: Joi.object({
    postId: Joi.string().required(),
  }),
});

export const updateCommentSchema = Joi.object({
  body: Joi.object({
    content: Joi.string().trim().min(1).max(1000).required(),
  }),
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

export const getCommentsSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
  params: Joi.object({
    postId: Joi.string().required(),
  }),
});

export const getCommentRepliesSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

export const deleteCommentSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

