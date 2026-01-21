import { Router } from 'express';
import { authenticate, requireCustomer } from '../middlewares/auth.middleware';
import {
  createReview,
  getUserReviews,
  updateReview,
  deleteReview
} from '../controllers/review.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     summary: Create a product review
 *     tags: [Reviews]
 *     description: Create a review for a product (Customer only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - rating
 *               - comment
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               rating:
 *                 type: number
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Excellent product!
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.post('/', authenticate, requireCustomer, createReview);

/**
 * @swagger
 * /api/v1/reviews/me:
 *   get:
 *     summary: Get my reviews
 *     tags: [Reviews]
 *     description: Retrieve all reviews created by the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, getUserReviews);

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   patch:
 *     summary: Update a review
 *     tags: [Reviews]
 *     description: Update a review (owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Updated review text
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not review owner
 *       404:
 *         description: Review not found
 */
router.patch('/:id', authenticate, updateReview);

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     description: Delete a review (owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not review owner
 *       404:
 *         description: Review not found
 */
router.delete('/:id', authenticate, deleteReview);

export default router;
