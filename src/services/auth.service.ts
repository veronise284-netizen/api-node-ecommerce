import { User, IUser } from '../models/user.model';
import crypto from 'crypto';

// Register new user
export const registerUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age?: number;
  role?: 'customer' | 'vendor' | 'admin';
}): Promise<{ user: IUser; token: string }> => {
  // Check if user exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create user
  const user = await User.create({
    ...userData,
    status: 'active'
  });

  // Generate token
  const token = user.generateAuthToken();

  return { user, token };
};

// Login user
export const loginUser = async (email: string, password: string): Promise<{ user: IUser; token: string }> => {
  // Find user with password field
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Check if user is active
  if (user.status !== 'active') {
    throw new Error('Account is not active. Please contact support.');
  }

  // Generate token
  const token = user.generateAuthToken();

  // Remove password from response
  user.password = undefined as any;

  return { user, token };
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<IUser | null> => {
  return await User.findById(userId).select('-password');
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updateData: Partial<IUser>
): Promise<IUser | null> => {
  // Don't allow updating password through this method
  const { password, ...safeUpdateData } = updateData as any;

  return await User.findByIdAndUpdate(
    userId,
    safeUpdateData,
    { new: true, runValidators: true }
  ).select('-password');
};

// Change password
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId).select('+password');
  
  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();
};

// Forgot password - generate reset token
export const forgotPassword = async (email: string): Promise<string> => {
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('No user found with this email');
  }

  const resetToken = user.generateResetToken();
  await user.save();

  return resetToken;
};

export const resetPassword = async (
  resetToken: string,
  newPassword: string
): Promise<void> => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
};

export const getAllUsers = async (): Promise<IUser[]> => {
  return await User.find().select('-password');
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  const result = await User.findByIdAndDelete(userId);
  return !!result;
};

export const updateUserStatus = async (
  userId: string,
  status: 'active' | 'inactive' | 'pending'
): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true, runValidators: true }
  ).select('-password');
};
