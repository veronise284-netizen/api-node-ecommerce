import { Order, IOrder } from '../models/order.model';
import { Product } from '../models/product.model';
import * as CartService from './cart.service';
import mongoose from 'mongoose';

// Create order from cart with transaction support
export const createOrderFromCart = async (userId: string): Promise<IOrder> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await CartService.getCart(userId);

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Cannot create order from empty cart');
    }

    const orderItems = [];

    // Check stock and update inventory
    for (const item of cart.items) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (!product.inStock || product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`);
      }

      // Reduce product quantity
      product.quantity -= item.quantity;
      if (product.quantity === 0) {
        product.inStock = false;
      }
      await product.save({ session });

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: product.price * item.quantity
      });
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Create order
    const order = await Order.create([{
      userId: new mongoose.Types.ObjectId(userId),
      items: orderItems,
      totalAmount: totalAmount,
      status: 'pending'
    }], { session });

    // Clear cart
    await CartService.clearCart(userId);

    // Commit transaction
    await session.commitTransaction();

    return order[0];
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Cancel order and restore inventory
export const cancelOrder = async (orderId: string, userId: string): Promise<IOrder | null> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId.toString() !== userId) {
      throw new Error('Unauthorized to cancel this order');
    }

    if (order.status !== 'pending') {
      throw new Error(`Cannot cancel order with status: ${order.status}. Only pending orders can be cancelled.`);
    }

    // Restore product inventory
    for (const item of order.items) {
      const product = await Product.findById(item.productId).session(session);
      
      if (product) {
        product.quantity += item.quantity;
        product.inStock = true;
        await product.save({ session });
      }
    }

    // Update order status
    order.status = 'cancelled';
    await order.save({ session });

    // Commit transaction
    await session.commitTransaction();

    return order;
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Get user orders
export const getUserOrders = async (userId: string): Promise<IOrder[]> => {
  return await Order.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .exec();
};

// Get order by ID
export const getOrderById = async (orderId: string): Promise<IOrder | null> => {
  return await Order.findById(orderId).exec();
};

export const getAllOrders = async (filters: {
  status?: string;
  userId?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ orders: IOrder[]; pagination: any }> => {
  const query: any = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.userId) {
    query.userId = new mongoose.Types.ObjectId(filters.userId);
  }

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'firstName lastName email')
    .exec();

  const total = await Order.countDocuments(query);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Admin: Update order status
export const updateOrderStatus = async (
  orderId: string,
  newStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
): Promise<IOrder | null> => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  // Validate status transition
  const validTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: []
  };

  if (!validTransitions[order.status].includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${order.status} to ${newStatus}`
    );
  }

  order.status = newStatus;
  return await order.save();
};

// Get order statistics (for admin dashboard)
export const getOrderStatistics = async (): Promise<any> => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);

  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    {
      $match: { status: { $ne: 'cancelled' } }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' }
      }
    }
  ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    byStatus: stats
  };
};
