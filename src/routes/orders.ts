import { Router } from 'express';
import * as OrderController from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create order from cart
 *     tags: [Orders]
 *     description: Create a new order from the current user's cart. Cart will be cleared after order creation.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *                   example: Order created successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cannot create order from empty cart
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Cannot create order from empty cart
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
// All order routes require authentication
// Customers can access their own orders

// POST /api/orders - Create order from cart
router.post('/', authenticate, OrderController.createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get my orders
 *     tags: [Orders]
 *     description: Get all orders for the authenticated user
 *     security:
 *       - bearerAuth: []
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
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
// GET /api/orders - Get all orders for logged-in user
router.get('/', authenticate, OrderController.getMyOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     description: Get a specific order. Users can only view their own orders unless they are admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied - Can only view own orders
 *         content:
 *           application/json:
 *             example:
 *               message: Access denied. You can only view your own orders.
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// GET /api/orders/:id - Get single order (ownership checked in controller)
router.get('/:id', authenticate, OrderController.getOrderById);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel order
 *     tags: [Orders]
 *     description: Cancel an order. Only pending orders can be cancelled. Users can only cancel their own orders.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
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
 *                   example: Order cancelled successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cannot cancel order with current status
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Cannot cancel order with status confirmed. Only pending orders can be cancelled.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Unauthorized to cancel this order
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// PATCH /api/orders/:id/cancel - Cancel order (only if pending)
router.patch('/:id/cancel', authenticate, OrderController.cancelOrder);

export default router;
