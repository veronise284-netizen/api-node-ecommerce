import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Review } from '../models/review.model';
import { Product } from '../models/product.model';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.helper';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.helper';

// @desc    Create a review for a product
// @route   POST /api/v1/reviews
// @access  Private (Customer)
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Authentication required'));
      return;
    }

    const { product, productId, rating, comment } = req.body;
    const prodId = product || productId; // Accept both field names

    // Validate required fields
    if (!prodId || !rating || !comment) {
      res.status(400).json(errorResponse('Product ID, rating, and comment are required'));
      return;
    }

    // Check if product exists
    const productDoc = await Product.findById(prodId);
    if (!productDoc) {
      res.status(404).json(errorResponse('Product not found'));
      return;
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: prodId,
      user: req.user.id
    });

    if (existingReview) {
      res.status(400).json(errorResponse('You have already reviewed this product'));
      return;
    }

    // Create review
    const review = await Review.create({
      product: prodId,
      user: req.user.id,
      rating,
      comment
    });

    // Populate user and product details
    await review.populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'product', select: 'name price images' }
    ]);

    res.status(201).json(successResponse(review, 'Review created successfully'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 'Failed to create review'));
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/v1/products/:productId/reviews
// @access  Public
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { page, limit, skip } = getPaginationParams(
      req.query.page as string,
      req.query.limit as string
    );

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json(errorResponse('Product not found'));
      return;
    }

    // Get reviews with pagination
    const reviews = await Review.find({ product: productId })
      .populate('user', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalItems = await Review.countDocuments({ product: productId });
    const pagination = getPaginationMeta(totalItems, page, limit);

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const stats = ratingStats[0] || { averageRating: 0, totalReviews: 0 };

    res.status(200).json({
      ...paginatedResponse(reviews, pagination),
      stats: {
        averageRating: Math.round(stats.averageRating * 10) / 10,
        totalReviews: stats.totalReviews
      }
    });
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 'Failed to fetch reviews'));
  }
};

// @desc    Get all reviews by the authenticated user
// @route   GET /api/v1/users/me/reviews
// @access  Private
export const getUserReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Authentication required'));
      return;
    }

    const { page, limit, skip } = getPaginationParams(
      req.query.page as string,
      req.query.limit as string
    );

    const reviews = await Review.find({ user: req.user.id })
      .populate('product', 'name price images category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalItems = await Review.countDocuments({ user: req.user.id });
    const pagination = getPaginationMeta(totalItems, page, limit);

    res.status(200).json(paginatedResponse(reviews, pagination));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 'Failed to fetch reviews'));
  }
};

// @desc    Update a review
// @route   PATCH /api/v1/reviews/:id
// @access  Private (Review owner)
export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Authentication required'));
      return;
    }

    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      res.status(404).json(errorResponse('Review not found'));
      return;
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      res.status(403).json(errorResponse('You can only update your own reviews'));
      return;
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    await review.populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'product', select: 'name price images' }
    ]);

    res.status(200).json(successResponse(review, 'Review updated successfully'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 'Failed to update review'));
  }
};

// @desc    Delete a review
// @route   DELETE /api/v1/reviews/:id
// @access  Private (Review owner or Admin)
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Authentication required'));
      return;
    }

    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      res.status(404).json(errorResponse('Review not found'));
      return;
    }

    // Check ownership or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json(errorResponse('You can only delete your own reviews'));
      return;
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json(successResponse(null, 'Review deleted successfully'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 'Failed to delete review'));
  }
};

// Add mongoose import for ObjectId
import mongoose from 'mongoose';
