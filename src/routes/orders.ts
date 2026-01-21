import { Router } from 'express';
import * as OrderController from '../controllers/order.controller';
import { authenticate, requireCustomer } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     description: Place a new order from the authenticated user's cart (no request body required)
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
 *                   example: Order placed successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, requireCustomer, OrderController.createOrder);

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get my orders
 *     tags: [Orders]
 *     description: Retrieve all orders for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
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
 *                   example: 5
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, requireCustomer, OrderController.getMyOrders);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     description: Retrieve a specific order by its ID. Users can only view their own orders.
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
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not your order
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticate, requireCustomer, OrderController.getOrderById);

/**
 * @swagger
 * /api/v1/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     description: Cancel an order by ID. Only pending orders can be cancelled.
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
 *         description: Cannot cancel order (already shipped/delivered)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not your order
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/cancel', authenticate, requireCustomer, OrderController.cancelOrder);

export default router;
