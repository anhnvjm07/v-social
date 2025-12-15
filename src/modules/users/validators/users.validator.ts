import Joi from "joi";

export const getUserProfileSchema = Joi.object({
  params: Joi.object({
    userId: Joi.string().required(),
  }),
});

export const updateProfileSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().trim().min(1).max(50).optional(),
    lastName: Joi.string().trim().min(1).max(50).optional(),
    username: Joi.string().trim().min(3).max(30).alphanum().optional(),
    bio: Joi.string().trim().max(500).optional(),
  }),
});

