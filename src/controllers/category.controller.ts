import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as CategoryService from '../services/category.service';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      search: req.query.search as string
    };

    const categories = await CategoryService.getAllCategories(filters);

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error fetching categories', 
      error: error.message 
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await CategoryService.getCategoryById(req.params.id);

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.status(200).json({
      success: true,
      category
    });
  } catch (error: any) {
    if (error.kind === 'ObjectId') {
      res.status(400).json({ message: 'Invalid category ID format' });
      return;
    }
    res.status(500).json({ 
      message: 'Error fetching category', 
      error: error.message 
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Category name is required' });
      return;
    }

    const category = await CategoryService.createCategory({
      name,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category with this name already exists' });
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
      message: 'Error creating category', 
      error: error.message 
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, isActive } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await CategoryService.updateCategory(req.params.id, updateData);

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category with this name already exists' });
      return;
    }
    if (error.kind === 'ObjectId') {
      res.status(400).json({ message: 'Invalid category ID format' });
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
      message: 'Error updating category', 
      error: error.message 
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deleted = await CategoryService.deleteCategory(req.params.id);

    if (!deleted) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error: any) {
    if (error.kind === 'ObjectId') {
      res.status(400).json({ message: 'Invalid category ID format' });
      return;
    }
    res.status(500).json({ 
      message: 'Error deleting category', 
      error: error.message 
    });
  }
};
