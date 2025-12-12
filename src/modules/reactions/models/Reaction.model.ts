import mongoose, { Schema, Document, Model } from 'mongoose';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
export type ReactionTargetType = 'post' | 'comment';

export interface IReaction extends Document {
  user: mongoose.Types.ObjectId;
  targetType: ReactionTargetType;
  target: mongoose.Types.ObjectId;
  type: ReactionType;
  createdAt: Date;
  updatedAt: Date;
}

const reactionSchema = new Schema<IReaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['post', 'comment'],
      required: true,
      index: true,
    },
    target: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
      index: true,
    },
    type: {
      type: String,
      enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one reaction per user per target
reactionSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });
reactionSchema.index({ targetType: 1, target: 1, createdAt: -1 });

export const Reaction: Model<IReaction> = mongoose.model<IReaction>('Reaction', reactionSchema);

