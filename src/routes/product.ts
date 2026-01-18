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
 *     description: Get list of all products with optional filters and pagination (Public access)
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Filter by stock availability
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in product name and description
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
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const filters = {
      category: req.query.category as string,
      inStock: req.query.inStock === 'true' ? true : req.query.inStock === 'false' ? false : undefined,
      search: req.query.search as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined
    };

    const pagination = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10
    };

    const result = await ProductService.getAllProducts(filters, pagination);
    res.json(result);
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
 *     description: Get a specific product's information (Public access)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// GET /products/:id - Get single product by ID
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
 *     summary: Create new product
 *     tags: [Products]
 *     description: Create a new product (Admin or Vendor). Product will be assigned to the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductRequest'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// POST /products - Create new product (PROTECTED - Vendor or Admin)
router.post("/", authenticate, requireVendorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, description, category, inStock, quantity } = req.body;

    // Basic validation
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
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     description: Update an existing product. Vendors can only update their own products. Admins can update any product.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductRequest'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Vendor can only update own products
 *         content:
 *           application/json:
 *             example:
 *               message: Access denied. You can only modify products you created.
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// PUT /products/:id - Update product (PROTECTED - Vendor can only update own products, Admin can update any)
router.put("/:id", authenticate, requireVendorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, description, category, inStock, quantity } = req.body;

    // Validate price if provided
    if (price !== undefined && price <= 0) {
      return res.status(400).json({ message: "price must be greater than 0" });
    }

    // Validate quantity if provided
    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({ message: "quantity cannot be negative" });
    }

    // Check ownership if user is a vendor
    const product = await ProductService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.user!.role === 'vendor') {
      if (!product.createdBy || product.createdBy.toString() !== req.user!.id) {
        return res.status(403).json({ 
          message: "Access denied. You can only update your own products." 
        });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (inStock !== undefined) updateData.inStock = inStock;
    if (quantity !== undefined) updateData.quantity = quantity;

    const updatedProduct = await ProductService.updateProduct(req.params.id, updateData);
    
    res.json(updatedProduct);
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
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     description: Delete a product. Vendors can only delete their own products. Admins can delete any product.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Product deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Vendor can only delete own products
 *         content:
 *           application/json:
 *             example:
 *               message: Access denied. You can only delete your own products.
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// DELETE /products/:id - Delete product (PROTECTED - Vendor can only delete their own, Admin can delete any)
router.delete("/:id", authenticate, requireVendorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Check ownership if user is a vendor
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

// Additional Routes

// GET /products/category/:category - Get products by category
router.get("/category/:category", async (req: Request, res: Response) => {
  try {
    const products = await ProductService.getProductsByCategory(req.params.category);
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching products by category', error: error.message });
  }
});

// GET /products/stats/categories - Get category statistics
router.get("/stats/categories", async (req: Request, res: Response) => {
  try {
    const stats = await ProductService.getCategoryStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching category stats', error: error.message });
  }
});

export default router;

