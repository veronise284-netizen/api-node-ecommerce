import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  description?: string;
  category: string;
  inStock: boolean;
  quantity: number;
  images?: string[];
  createdBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    trim: true,
    index: true // Simple index for name queries
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    index: true // Index for price range queries
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    enum: {
      values: ['electronics', 'clothing', 'books', 'home', 'sports'],
      message: 'Category must be one of: electronics, clothing, books, home, sports'
    },
    index: true // Index for category filtering
  },
  inStock: { 
    type: Boolean, 
    default: true,
    index: true // Index for stock filtering
  },
  quantity: { 
    type: Number, 
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  images: [{
    type: String
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true  
});

// Compound indexes for common query combinations
ProductSchema.index({ category: 1, price: 1 }); // Category + price sorting
ProductSchema.index({ inStock: 1, category: 1 }); // Stock status + category
ProductSchema.index({ createdBy: 1, createdAt: -1 }); // Vendor products

// Text index for search functionality
ProductSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
