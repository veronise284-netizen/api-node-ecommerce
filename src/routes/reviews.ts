import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  createReview,
  getUserReviews,
  updateReview,
  deleteReview
} from '../controllers/review.controller';

const router = Router();

// @route   POST /api/reviews
// @desc    Create a review for a product
// @access  Private (Customer)
router.post('/', authenticate, createReview);

// @route   GET /api/reviews/me
// @desc    Get all reviews by authenticated user
// @access  Private
router.get('/me', authenticate, getUserReviews);

// @route   PATCH /api/reviews/:id
// @desc    Update a review
// @access  Private (Review owner)
router.patch('/:id', authenticate, updateReview);

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private (Review owner or Admin)
router.delete('/:id', authenticate, deleteReview);

export default router;
