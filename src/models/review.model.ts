import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReviewSchema = new Schema<IReview>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
    index: true // Index for product reviews lookup
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true // Index for user reviews lookup
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    trim: true
  }
}, {
  timestamps: true
});

// Compound indexes
ReviewSchema.index({ product: 1, createdAt: -1 }); // Product reviews sorted by date
ReviewSchema.index({ user: 1, createdAt: -1 }); // User reviews sorted by date
ReviewSchema.index({ product: 1, user: 1 }, { unique: true }); // One review per user per product

// Text index for searching reviews
ReviewSchema.index({ comment: 'text' });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
