import { Cart, ICart } from '../models/cart.model';
import { Product } from '../models/product.model';
import mongoose from 'mongoose';

export const getOrCreateCart = async (userId: string): Promise<ICart> => {
  let cart = await Cart.findOne({ userId }).populate('items.productId', 'name price inStock');
  
  if (!cart) {
    cart = await Cart.create({ userId, items: [], totalAmount: 0 });
  }
  
  return cart;
};

export const getCart = async (
  userId: string,
  session?: mongoose.ClientSession
): Promise<ICart | null> => {
  const query = Cart.findOne({ userId }).populate('items.productId', 'name price description inStock quantity');
  if (session) {
    query.session(session);
  }
  return await query;
};

export const addItemToCart = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<ICart> => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }
  
  if (!product.inStock || product.quantity < quantity) {
    throw new Error('Product is out of stock or insufficient quantity available');
  }

  let cart = await Cart.findOne({ userId });
  
  if (!cart) {
    cart = new Cart({ userId, items: [], totalAmount: 0 });
  }

  const existingItemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (existingItemIndex > -1) {
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    
    if (product.quantity < newQuantity) {
      throw new Error('Insufficient product quantity available');
    }
    
    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].price = product.price;
  } else {
    cart.items.push({
      productId: new mongoose.Types.ObjectId(productId),
      quantity,
      price: product.price
    });
  }

  await cart.save();
  return await Cart.findOne({ userId }).populate('items.productId', 'name price description inStock quantity') as ICart;
};

export const updateCartItem = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<ICart | null> => {
  if (quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }
  
  if (product.quantity < quantity) {
    throw new Error('Insufficient product quantity available');
  }

  const cart = await Cart.findOne({ userId });
  
  if (!cart) {
    throw new Error('Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }

  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].price = product.price;

  await cart.save();
  return await Cart.findOne({ userId }).populate('items.productId', 'name price description inStock quantity');
};

export const removeCartItem = async (
  userId: string,
  productId: string
): Promise<ICart | null> => {
  const cart = await Cart.findOne({ userId });
  
  if (!cart) {
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(
    item => item.productId.toString() !== productId
  );

  await cart.save();
  return await Cart.findOne({ userId }).populate('items.productId', 'name price description inStock quantity');
};

export const clearCart = async (
  userId: string,
  session?: mongoose.ClientSession
): Promise<ICart | null> => {
  const query = Cart.findOne({ userId });
  if (session) {
    query.session(session);
  }
  const cart = await query;
  
  if (!cart) {
    throw new Error('Cart not found');
  }

  cart.items = [];
  cart.totalAmount = 0;

  await cart.save({ session });
  return cart;
};

export const deleteCart = async (userId: string): Promise<boolean> => {
  const result = await Cart.findOneAndDelete({ userId });
  return !!result;
};
