import Joi from "joi";

export const searchSchema = Joi.object({
  query: Joi.object({
    q: Joi.string().trim().min(1).required(),
    type: Joi.string()
      .valid("users", "posts", "hashtags", "all")
      .default("all")
      .optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid("asc", "desc").default("desc").optional(),
    filters: Joi.string().optional(), // JSON string
  }),
});

