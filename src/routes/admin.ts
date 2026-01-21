import { Router } from 'express';
import * as OrderController from '../controllers/order.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/admin/orders:
 *   get:
 *     summary: Get all orders (Admin)
 *     tags: [Admin]
 *     description: Retrieve all orders in the system (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 50
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/orders', authenticate, requireAdmin, OrderController.getAllOrders);

/**
 * @swagger
 * /api/v1/admin/orders/statistics:
 *   get:
 *     summary: Get order statistics (Admin)
 *     tags: [Admin]
 *     description: Get aggregated order statistics including counts by status and total revenue (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics retrieved successfully
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
 *                       type: number
 *                       example: 150
 *                     totalRevenue:
 *                       type: number
 *                       example: 15000.50
 *                     ordersByStatus:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: number
 *                           example: 30
 *                         processing:
 *                           type: number
 *                           example: 45
 *                         shipped:
 *                           type: number
 *                           example: 50
 *                         delivered:
 *                           type: number
 *                           example: 20
 *                         cancelled:
 *                           type: number
 *                           example: 5
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/orders/statistics', authenticate, requireAdmin, OrderController.getOrderStatistics);

/**
 * @swagger
 * /api/v1/admin/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Admin)
 *     tags: [Admin]
 *     description: Update the status of an order (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipped, delivered, cancelled]
 *                 example: shipped
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
 *         description: Bad request - Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.patch('/orders/:id/status', authenticate, requireAdmin, OrderController.updateOrderStatus);

export default router;
