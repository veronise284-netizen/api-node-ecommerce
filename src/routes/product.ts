import { Router, Request, Response } from "express";
import * as ProductService from '../services/product.service';
import { authenticate, requireVendorOrAdmin, AuthRequest } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';

const router = Router();

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     description: Retrieve a single product by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     description: Create a new product (Vendor or Admin only). Vendors can only manage their own products.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: Wireless Headphones
 *               price:
 *                 type: number
 *                 example: 99.99
 *               description:
 *                 type: string
 *                 example: High-quality wireless headphones with noise cancellation
 *               category:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               inStock:
 *                 type: boolean
 *                 example: true
 *               quantity:
 *                 type: number
 *                 example: 50
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Vendor or Admin access required
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     description: Delete a product by ID. Vendors can only delete their own products, admins can delete any product.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Product deleted successfully
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
 *                   example: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - You can only delete your own products
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/products/category/{category}:
 *   get:
 *     summary: Get products by category
 *     tags: [Products]
 *     description: Retrieve all products in a specific category
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: List of products in the category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
router.get("/category/:category", async (req: Request, res: Response) => {
  try {
    const products = await ProductService.getProductsByCategory(req.params.category);
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching products by category', error: error.message });
  }
});

/**
 * @swagger
 * /api/products/stats/categories:
 *   get:
 *     summary: Get product statistics by category
 *     tags: [Products]
 *     description: Get aggregated statistics showing product count per category
 *     responses:
 *       200:
 *         description: Category statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: Electronics
 *                   count:
 *                     type: number
 *                     example: 15
 *       500:
 *         description: Server error
 */
router.get("/stats/categories", async (req: Request, res: Response) => {
  try {
    const stats = await ProductService.getCategoryStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching category stats', error: error.message });
  }
});

export default router;

