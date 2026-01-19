import { Router, Request, Response } from "express";
import * as ProductService from '../services/product.service';
import { authenticate, requireVendorOrAdmin, AuthRequest } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';

const router = Router();

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});


router.post("/", authenticate, requireVendorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, description, category, inStock, quantity } = req.body;

    if (!name || typeof price !== "number" || !category) {
      return res.status(400).json({
        message: "name (string), price (number), and category (string) are required",
      });
    }

    if (price <= 0) {
      return res.status(400).json({ message: "price must be greater than 0" });
    }

    const productData = {
      name,
      price,
      description,
      category,
      inStock: inStock ?? true,
      quantity: quantity ?? 0,
      createdBy: new mongoose.Types.ObjectId(req.user!.id) // Track who created the product
    };

    const product = await ProductService.createProduct(productData);
    res.status(201).json(product);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});


router.delete("/:id", authenticate, requireVendorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.user!.role === 'vendor') {
      if (!product.createdBy || product.createdBy.toString() !== req.user!.id) {
        return res.status(403).json({ 
          message: "Access denied. You can only delete your own products." 
        });
      }
    }

    const deleted = await ProductService.deleteProduct(req.params.id);
    
    res.status(200).json({ 
      success: true, 
      message: "Product deleted successfully" 
    });
  } catch (error: any) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});


router.get("/category/:category", async (req: Request, res: Response) => {
  try {
    const products = await ProductService.getProductsByCategory(req.params.category);
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching products by category', error: error.message });
  }
});

router.get("/stats/categories", async (req: Request, res: Response) => {
  try {
    const stats = await ProductService.getCategoryStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching category stats', error: error.message });
  }
});

export default router;

