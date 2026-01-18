import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as CartService from '../services/cart.service';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const cart = await CartService.getOrCreateCart(req.user.id);

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error fetching cart', 
      error: error.message 
    });
  }
};

export const addItemToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      res.status(400).json({ message: 'Product ID and quantity are required' });
      return;
    }

    if (quantity < 1) {
      res.status(400).json({ message: 'Quantity must be at least 1' });
      return;
    }

    const cart = await CartService.addItemToCart(req.user.id, productId, quantity);

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cart
    });
  } catch (error: any) {
    if (error.message === 'Product not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    if (error.message.includes('out of stock') || error.message.includes('Insufficient')) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ 
      message: 'Error adding item to cart', 
      error: error.message 
    });
  }
};


export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity) {
      res.status(400).json({ message: 'Quantity is required' });
      return;
    }

    if (quantity < 1) {
      res.status(400).json({ message: 'Quantity must be at least 1' });
      return;
    }

    const cart = await CartService.updateCartItem(req.user.id, productId, quantity);

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      cart
    });
  } catch (error: any) {
    if (error.message === 'Cart not found' || error.message === 'Product not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    if (error.message === 'Item not found in cart') {
      res.status(404).json({ message: error.message });
      return;
    }
    if (error.message.includes('Insufficient')) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ 
      message: 'Error updating cart item', 
      error: error.message 
    });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { productId } = req.params;

    const cart = await CartService.removeCartItem(req.user.id, productId);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      cart
    });
  } catch (error: any) {
    if (error.message === 'Cart not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ 
      message: 'Error removing cart item', 
      error: error.message 
    });
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const cart = await CartService.clearCart(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error: any) {
    if (error.message === 'Cart not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ 
      message: 'Error clearing cart', 
      error: error.message 
    });
  }
};
