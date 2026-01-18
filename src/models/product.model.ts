import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  description?: string;
  category: string;
  inStock: boolean;
  quantity: number;
  createdBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    trim: true
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
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
    }
  },
  inStock: { 
    type: Boolean, 
    default: true 
  },
  quantity: { 
    type: Number, 
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true  
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
