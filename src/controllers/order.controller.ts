import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as OrderService from '../services/order.service';
import * as AuthService from '../services/auth.service';
import { sendEmail, emailTemplates } from '../services/email.service';

// Customer: Create order from cart
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const order = await OrderService.createOrderFromCart(req.user.id);

    // Send order placed email
    const user = await AuthService.getUserProfile(req.user.id);
    if (user) {
      sendEmail(
        user.email, 
        emailTemplates.orderPlaced(user.firstName, order._id.toString(), order.totalAmount, order.items)
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error: any) {
    if (error.message === 'Cannot create order from empty cart') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Customer: Get all own orders
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const orders = await OrderService.getUserOrders(req.user.id);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Customer: Get single order (own order only)
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const order = await OrderService.getOrderById(id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Check ownership (customers can only view their own orders)
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id) {
      res.status(403).json({
        message: 'Access denied. You can only view your own orders.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error: any) {
    if (error.kind === 'ObjectId') {
      res.status(400).json({ message: 'Invalid order ID format' });
      return;
    }
    res.status(500).json({
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Customer: Cancel own order (only if pending)
export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const order = await OrderService.cancelOrder(id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error: any) {
    if (error.message === 'Order not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    if (error.message === 'Unauthorized to cancel this order') {
      res.status(403).json({ message: error.message });
      return;
    }
    if (error.message.includes('Cannot cancel order')) {
      res.status(400).json({ message: error.message });
      return;
    }
    if (error.kind === 'ObjectId') {
      res.status(400).json({ message: 'Invalid order ID format' });
      return;
    }
    res.status(500).json({
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

// Admin: Get all orders with filters
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filters = {
      status: req.query.status as string,
      userId: req.query.userId as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10
    };

    const result = await OrderService.getAllOrders(filters);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Admin: Update order status
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ message: 'Status is required' });
      return;
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
      return;
    }

    const order = await OrderService.updateOrderStatus(id, status);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Send order status update email
    const user = await AuthService.getUserProfile(order.userId.toString());
    if (user) {
      sendEmail(
        user.email,
        emailTemplates.orderStatusUpdate(user.firstName, order._id.toString(), status)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error: any) {
    if (error.message === 'Order not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    if (error.message.includes('Invalid status transition')) {
      res.status(400).json({ message: error.message });
      return;
    }
    if (error.kind === 'ObjectId') {
      res.status(400).json({ message: 'Invalid order ID format' });
      return;
    }
    res.status(500).json({
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// Admin: Get order statistics
export const getOrderStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await OrderService.getOrderStatistics();

    res.status(200).json({
      success: true,
      statistics: stats
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching order statistics',
      error: error.message
    });
  }
};
