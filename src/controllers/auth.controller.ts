import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as AuthService from '../services/auth.service';
import { 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  sendPasswordChangedEmail 
} from '../services/email.service';
import { User } from '../models/user.model';
import { deleteFile } from '../middlewares/upload.middleware';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, age, role } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ 
        message: 'Please provide firstName, lastName, email, and password' 
      });
      return;
    }

    const { user, token } = await AuthService.registerUser({
      firstName,
      lastName,
      email,
      password,
      age,
      role
    });

    // Send welcome email (don't wait for it)
    sendWelcomeEmail(user.email, user.firstName).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        status: user.status,
        role: user.role
      }
    });
  } catch (error: any) {
    if (error.message === 'User with this email already exists') {
      res.status(400).json({ message: error.message });
      return;
    }
    if (error.name === 'ValidationError') {
      res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
      return;
    }
    res.status(500).json({ 
      message: 'Error registering user', 
      error: error.message 
    });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    const { user, token } = await AuthService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        status: user.status,
        role: user.role
      }
    });
  } catch (error: any) {
    if (error.message === 'Invalid email or password' || 
        error.message.includes('Account is not active')) {
      res.status(401).json({ message: error.message });
      return;
    }
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message 
    });
  }
};


export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const user = await AuthService.getUserProfile(req.user.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error fetching profile', 
      error: error.message 
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { firstName, lastName, age } = req.body;

    const user = await AuthService.updateUserProfile(req.user.id, {
      firstName,
      lastName,
      age
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        status: user.status
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error updating profile', 
      error: error.message 
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ 
        message: 'Please provide current password and new password' 
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ 
        message: 'New password must be at least 8 characters' 
      });
      return;
    }

    await AuthService.changePassword(req.user.id, currentPassword, newPassword);

    // Send password changed confirmation email
    const user = await AuthService.getUserProfile(req.user.id);
    if (user) {
      sendPasswordChangedEmail(user.email, user.firstName).catch(err => {
        console.error('Failed to send password changed email:', err);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    if (error.message === 'Current password is incorrect') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ 
      message: 'Error changing password', 
      error: error.message 
    });
  }
};


export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Debug logging
    console.log('Forgot Password Request:', {
      body: req.body,
      headers: req.headers,
      contentType: req.headers['content-type']
    });

    if (!req.body) {
      res.status(400).json({ 
        message: 'Request body is missing. Please send JSON data with Content-Type: application/json',
        hint: 'Check Postman body settings - use raw JSON'
      });
      return;
    }

    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Please provide email' });
      return;
    }

    const { user, resetToken } = await AuthService.forgotPassword(email);

    // Send password reset email
    sendPasswordResetEmail(user.email, user.firstName, resetToken).catch(err => {
      console.error('Failed to send password reset email:', err);
    });
    
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to email',
      // For development/testing only - remove in production
      resetToken
    });
  } catch (error: any) {
    if (error.message === 'No user found with this email') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ 
      message: 'Error processing forgot password', 
      error: error.message 
    });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      res.status(400).json({ message: 'Reset token is required' });
      return;
    }

    if (!newPassword) {
      res.status(400).json({ message: 'Please provide new password' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ 
        message: 'Password must be at least 8 characters' 
      });
      return;
    }

    await AuthService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    if (error.message === 'Invalid or expired reset token') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ 
      message: 'Error resetting password', 
      error: error.message 
    });
  }
};


export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
 
  res.status(200).json({
    success: true,
    message: 'Logged out successfully. Please remove token from client.'
  });
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await AuthService.getAllUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: error.message 
    });
  }
};


export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user && req.user.id === id) {
      res.status(400).json({ message: 'Cannot delete your own account' });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.profilePicture) {
      try {
        await deleteFile(user.profilePicture);
      } catch (err) {
        console.error('Failed to delete profile picture:', err);
      }
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    if (error.kind === 'ObjectId') {
      res.status(400).json({ message: 'Invalid user ID format' });
      return;
    }
    res.status(500).json({ 
      message: 'Error deleting user', 
      error: error.message 
    });
  }
};


export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, age, status } = req.body;

    const user = await AuthService.updateUserProfile(id, {
      firstName,
      lastName,
      email,
      age,
      status
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error: any) {
    if (error.kind === 'ObjectId') {
      res.status(400).json({ message: 'Invalid user ID format' });
      return;
    }
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }
    res.status(500).json({ 
      message: 'Error updating user', 
      error: error.message 
    });
  }
};

// @desc    Upload profile picture
// @route   PUT /api/auth/profile/picture
// @access  Private
export const uploadProfilePicture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const userId = req.user!.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const { deleteFile } = require('../middlewares/upload.middleware');
      await deleteFile(user.profilePicture);
    }

    // Save new profile picture URL
    const { getFileUrl } = require('../middlewares/upload.middleware');
    user.profilePicture = getFileUrl(req, req.file);
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePicture
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error uploading profile picture', 
      error: error.message 
    });
  }
};
