import { Router } from 'express';
import * as OrderController from '../controllers/order.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Admin]
 *     description: Get all orders from all users with optional filters (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 orders:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Order'
 *                       - type: object
 *                         properties:
 *                           userId:
 *                             $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// All admin order routes require authentication + admin role

// GET /api/admin/orders - Get all orders (with filters)
router.get('/orders', authenticate, requireAdmin, OrderController.getAllOrders);

/**
 * @swagger
 * /api/admin/orders/statistics:
 *   get:
 *     summary: Get order statistics (Admin only)
 *     tags: [Admin]
 *     description: Get aggregated order statistics including total orders, revenue, and breakdown by status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: integer
 *                       example: 150
 *                     totalRevenue:
 *                       type: number
 *                       format: float
 *                       example: 45890.75
 *                     byStatus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: pending
 *                           count:
 *                             type: integer
 *                             example: 12
 *                           totalAmount:
 *                             type: number
 *                             format: float
 *                             example: 3250.50
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /api/admin/orders/statistics - Get order statistics
router.get('/orders/statistics', authenticate, requireAdmin, OrderController.getOrderStatistics);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     tags: [Admin]
 *     description: |
 *       Update order status. Valid transitions:
 *       - pending → confirmed, cancelled
 *       - confirmed → shipped, cancelled
 *       - shipped → delivered
 *       - delivered → (no transitions)
 *       - cancelled → (no transitions)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusRequest'
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order status updated successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid status or status transition
 *         content:
 *           application/json:
 *             examples:
 *               invalidTransition:
 *                 value:
 *                   success: false
 *                   message: Invalid status transition from delivered to pending
 *               missingStatus:
 *                 value:
 *                   success: false
 *                   message: Status is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// PATCH /api/admin/orders/:id/status - Update order status
router.patch('/orders/:id/status', authenticate, requireAdmin, OrderController.updateOrderStatus);

export default router;
