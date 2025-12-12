import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  createdAt: Date;
}

const followSchema = new Schema<IFollow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index to ensure unique follow relationship
followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ follower: 1 });
followSchema.index({ following: 1 });

// Prevent self-follow
followSchema.pre("save", function (next) {
  if (this.follower.toString() === this.following.toString()) {
    next(new Error("Cannot follow yourself"));
  } else {
    next();
  }
});

export const Follow: Model<IFollow> = mongoose.model<IFollow>(
  "Follow",
  followSchema
);
