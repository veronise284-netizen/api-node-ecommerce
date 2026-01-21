import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age?: number;
  status: 'active' | 'inactive' | 'pending';
  role: 'admin' | 'vendor' | 'customer';
  profilePicture?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateResetToken(): string;
}

const UserSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
    trim: true,
    index: true // Simple index for search
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    trim: true,
    index: true // Simple index for search
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Creates unique index
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false  
  },
  age: {
    type: Number,
    min: [18, 'Must be at least 18 years old'],
    max: [100, 'Age cannot exceed 100']
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'pending'],
      message: 'Status must be active, inactive, or pending'
    },
    default: 'pending'
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'vendor', 'customer'],
      message: 'Role must be admin, vendor, or customer'
    },
    required: [true, 'Role is required'],
    default: 'customer',
    index: true // Index for role-based queries
  },
  profilePicture: {
    type: String,
    default: null
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpire: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for full name searches
UserSchema.index({ firstName: 1, lastName: 1 });

// Text index for search functionality
UserSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

// Index for status queries
UserSchema.index({ status: 1 });

// Hash password before saving
// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function(): string {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  const payload = { 
    id: this._id.toString(), 
    email: this.email,
    role: this.role 
  };
  
  return jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
};

// Generate password reset token
UserSchema.methods.generateResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetToken;
};

export const User = mongoose.model<IUser>('User', UserSchema);
