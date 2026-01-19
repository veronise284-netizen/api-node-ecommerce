import { Router, Request, Response } from "express";
import * as ProductService from '../services/product.service';
import { authenticate, requireVendorOrAdmin, AuthRequest } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';

const router = Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     description: Retrieve a list of all products with optional filtering and pagination
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Filter by stock availability
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name or description
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
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
 *                   example: 8
 *                 total:
 *                   type: number
 *                   example: 25
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                       example: 1
 *                     limit:
 *                       type: number
 *                       example: 10
 *                     total:
 *                       type: number
 *                       example: 25
 *                     pages:
 *                       type: number
 *                       example: 3
 *       500:
 *         description: Server error
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const filters: any = {};
    const pagination: any = {};
    
    if (req.query.category) {
      filters.category = req.query.category;
    }
    if (req.query.minPrice) {
      filters.minPrice = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      filters.maxPrice = Number(req.query.maxPrice);
    }
    if (req.query.inStock !== undefined) {
      filters.inStock = req.query.inStock === 'true';
    }
    if (req.query.search) {
      filters.search = req.query.search;
    }
    if (req.query.page) {
      pagination.page = Number(req.query.page);
    }
    if (req.query.limit) {
      pagination.limit = Number(req.query.limit);
    }
    
    const result = await ProductService.getAllProducts(filters, pagination);
    res.json({
      success: true,
      count: result.products.length,
      total: result.pagination.total,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

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
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     description: Update an existing product. Vendors can only update their own products, admins can update any product.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Wireless Headphones
 *               price:
 *                 type: number
 *                 example: 89.99
 *               description:
 *                 type: string
 *                 example: Updated description for wireless headphones
 *               category:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               inStock:
 *                 type: boolean
 *                 example: true
 *               quantity:
 *                 type: number
 *                 example: 75
 *     responses:
 *       200:
 *         description: Product updated successfully
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
 *                   example: Product updated successfully
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - You can only update your own products
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authenticate, requireVendorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check ownership for vendors
    if (req.user!.role === 'vendor') {
      if (!product.createdBy || product.createdBy.toString() !== req.user!.id) {
        return res.status(403).json({ 
          message: "Access denied. You can only update your own products." 
        });
      }
    }

    const { name, price, description, category, inStock, quantity } = req.body;

    // Validation
    if (price !== undefined && (typeof price !== "number" || price <= 0)) {
      return res.status(400).json({ message: "price must be a number greater than 0" });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (inStock !== undefined) updateData.inStock = inStock;
    if (quantity !== undefined) updateData.quantity = quantity;

    const updatedProduct = await ProductService.updateProduct(req.params.id, updateData);
    
    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    res.status(500).json({ message: 'Error updating product', error: error.message });
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

