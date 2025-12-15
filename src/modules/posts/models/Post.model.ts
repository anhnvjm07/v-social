import mongoose, { Schema, Document, Model } from "mongoose";

export type PostVisibility = "public" | "private" | "followers";

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  media: Array<{
    url: string;
    type: "image" | "video";
    publicId: string;
  }>;
  visibility: PostVisibility;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },
    media: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "private", "followers"],
      default: "public",
      index: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

export const Post: Model<IPost> = mongoose.model<IPost>("Post", postSchema);
