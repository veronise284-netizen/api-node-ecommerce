import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true, // Creates unique index
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
    index: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true, // Creates unique index
    lowercase: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true // Index for filtering active categories
  }
}, {
  timestamps: true
});

// Text index for search
CategorySchema.index({ name: 'text', description: 'text' });

// Generate slug from name before saving
CategorySchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
