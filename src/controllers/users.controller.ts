import type { Response, Request } from "express";
import { User, IUser } from "../models/user.model";
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.helper';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.helper';

async function getAllUsers(req: Request, res: Response) {
  try {
    const { page, limit, skip } = getPaginationParams(
      req.query.page as string,
      req.query.limit as string
    );

    // Build filter
    const filter: any = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Build sort
    let sort: any = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortField = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [sortField]: sortOrder };
    }

    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalItems = await User.countDocuments(filter);
    const pagination = getPaginationMeta(totalItems, page, limit);

    return res.status(200).json(paginatedResponse(users, pagination, filter));
  } catch (error: any) {
    return res.status(500).json(errorResponse(error.message, 'Failed to fetch users'));
  }
}

async function getUserById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user: user });
  } catch (error: any) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    return res.status(500).json({ 
      error: "Error fetching user", 
      message: error.message 
    });
  }
}

async function createUser(req: Request, res: Response) {
  try {
    const { firstName, lastName, email, password, age, status, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      age,
      status,
      role: role || 'vendor' // Default to vendor if not specified
    });

    await user.save();

    const { password: _, ...userResponse } = user.toObject();

    return res.status(201).json({
      message: "User created successfully",
      user: userResponse
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        errors: error.errors 
      });
    }
    return res.status(500).json({ 
      error: "Error creating user", 
      message: error.message 
    });
  }
}

async function updateUserById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const { firstName, lastName, email, password, age, status, role } = req.body;

    // Build update object
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password;
    if (age !== undefined) updateData.age = age;
    if (status !== undefined) updateData.status = status;
    if (role !== undefined) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: user
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        errors: error.errors 
      });
    }
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    return res.status(500).json({ 
      error: "Error updating user", 
      message: error.message 
    });
  }
}

async function deleteUserById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (error: any) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    return res.status(500).json({ 
      error: "Error deleting user", 
      message: error.message 
    });
  }
}

export { getAllUsers, getUserById, createUser, updateUserById, deleteUserById };
