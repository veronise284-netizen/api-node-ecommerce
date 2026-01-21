import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as ProductService from '../services/product.service';
import { deleteFile, getFileUrl } from '../middlewares/upload.middleware';
import { Product } from '../models/product.model';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.helper';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.helper';
import mongoose from 'mongoose';

// @desc    Get all products with pagination, filtering, sorting, and search
// @route   GET /api/v1/products
// @access  Public
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(
      req.query.page as string,
      req.query.limit as string
    );

    // Build filter object
    const filter: any = {};

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Stock filter
    if (req.query.inStock !== undefined) {
      filter.inStock = req.query.inStock === 'true';
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = parseFloat(req.query.minPrice as string);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = parseFloat(req.query.maxPrice as string);
      }
    }

    // Search filter (text search if search query exists)
    let query;
    if (req.query.search) {
      // Text search using text index
      query = Product.find({
        ...filter,
        $text: { $search: req.query.search as string }
      }, {
        score: { $meta: 'textScore' }
      }).sort({ score: { $meta: 'textScore' } });
    } else {
      query = Product.find(filter);
      
      // Build sort object
      let sort: any = { createdAt: -1 }; // Default sort

      if (req.query.sortBy) {
        const sortField = req.query.sortBy as string;
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        sort = { [sortField]: sortOrder };
      }

      query = query.sort(sort);
    }

    // Execute query with pagination
    const products = await query
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName');

    const totalItems = await Product.countDocuments(
      req.query.search 
        ? { ...filter, $text: { $search: req.query.search as string } }
        : filter
    );
    
    const pagination = getPaginationMeta(totalItems, page, limit);

    res.status(200).json(
      paginatedResponse(
        products, 
        pagination, 
        Object.keys(filter).length > 0 ? filter : undefined,
        req.query.search as string
      )
    );
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 'Failed to fetch products'));
  }
};

// @desc    Get product statistics by category
// @route   GET /api/v1/products/stats
// @access  Public
export const getProductStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Product.aggregate([
      // Stage 1: Filter - Only in-stock products
      {
        $match: { inStock: true }
      },
      
      // Stage 2: Group - By category and calculate
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      
      // Stage 3: Sort - By total products (descending)
      {
        $sort: { totalProducts: -1 }
      },
      
      // Stage 4: Format - Clean output
      {
        $project: {
          category: '$_id',
          totalProducts: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          minPrice: 1,
          maxPrice: 1,
          totalQuantity: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json(successResponse(stats, 'Product statistics retrieved successfully'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 'Failed to fetch product statistics'));
  }
};

// @desc    Get top 10 most expensive products
// @route   GET /api/v1/products/top
// @access  Public
export const getTopProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const topProducts = await Product.aggregate([
      // Stage 1: Filter - Only in-stock
      {
        $match: { inStock: true }
      },
      
      // Stage 2: Sort - By price (highest first)
      {
        $sort: { price: -1 }
      },
      
      // Stage 3: Limit - Top N only
      {
        $limit: limit
      },
      
      // Stage 4: Format - Select fields
      {
        $project: {
          name: 1,
          price: 1,
          category: 1,
          quantity: 1,
          images: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: topProducts.length,
      data: topProducts
    });
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 'Failed to fetch top products'));
  }
};

// @desc    Get low stock products (quantity < 10)
// @route   GET /api/v1/products/low-stock
// @access  Private (Admin/Vendor)
export const getLowStockProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 10;

    const lowStock = await Product.aggregate([
      // Stage 1: Filter - Low quantity
      {
        $match: {
          quantity: { $lt: threshold },
          inStock: true
        }
      },
      
      // Stage 2: Sort - Lowest quantity first
      {
        $sort: { quantity: 1 }
      },
      
      // Stage 3: Format
      {
        $project: {
          name: 1,
          category: 1,
          quantity: 1,
          price: 1,
          alert: {
            $concat: ['Only ', { $toString: '$quantity' }, ' left in stock!']
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: lowStock.length,
      threshold,
      data: lowStock
    });
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 'Failed to fetch low stock products'));
  }
};

// @desc    Get price range distribution
// @route   GET /api/v1/products/price-distribution
// @access  Public
export const getPriceDistribution = async (req: Request, res: Response): Promise<void> => {
  try {
    const distribution = await Product.aggregate([
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 50, 100, 500, 1000, 5000],
          default: '5000+',
          output: {
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            products: { 
              $push: { 
                name: '$name', 
                price: '$price' 
              } 
            }
          }
        }
      },
      {
        $project: {
          priceRange: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 0] }, then: '$0 - $50' },
                { case: { $eq: ['$_id', 50] }, then: '$50 - $100' },
                { case: { $eq: ['$_id', 100] }, then: '$100 - $500' },
                { case: { $eq: ['$_id', 500] }, then: '$500 - $1000' },
                { case: { $eq: ['$_id', 1000] }, then: '$1000 - $5000' }
              ],
              default: '$5000+'
            }
          },
          count: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          products: { $slice: ['$products', 5] } // Show only first 5 products
        }
      }
    ]);

    res.status(200).json(successResponse(distribution, 'Price distribution retrieved successfully'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 'Failed to fetch price distribution'));
  }
};

// @desc    Upload product images
// @route   POST /api/products/:id/images
// @access  Private (Vendor/Admin)
export const uploadProductImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }

    const productId = req.params.id;
    const product = await ProductService.getProductById(productId);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check ownership for vendors
    if (req.user!.role === 'vendor') {
      if (!product.createdBy || product.createdBy.toString() !== req.user!.id) {
        res.status(403).json({ 
          message: 'Access denied. You can only upload images for your own products.' 
        });
        return;
      }
    }

    // Get file URLs
    const files = Array.isArray(req.files) ? req.files : [];
    const imageUrls = files.map((file: Express.Multer.File) => getFileUrl(req, file));

    // Add images to product
    const existingImages = product.images || [];
    const updatedProduct = await ProductService.updateProduct(productId, {
      images: [...existingImages, ...imageUrls]
    });

    res.json({
      success: true,
      message: `${files.length} image(s) uploaded successfully`,
      images: updatedProduct?.images || []
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error uploading product images', 
      error: error.message 
    });
  }
};

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:imageIndex
// @access  Private (Vendor/Admin)
export const deleteProductImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: productId, imageIndex } = req.params;
    const product = await ProductService.getProductById(productId);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check ownership for vendors
    if (req.user!.role === 'vendor') {
      if (!product.createdBy || product.createdBy.toString() !== req.user!.id) {
        res.status(403).json({ 
          message: 'Access denied. You can only delete images from your own products.' 
        });
        return;
      }
    }

    const index = parseInt(imageIndex);
    if (isNaN(index) || index < 0 || !product.images || index >= product.images.length) {
      res.status(400).json({ message: 'Invalid image index' });
      return;
    }

    // Delete file from storage (Cloudinary or local)
    const imageUrl = product.images[index];
    await deleteFile(imageUrl);

    // Remove image from product
    const updatedImages = product.images.filter((_, i) => i !== index);
    const updatedProduct = await ProductService.updateProduct(productId, {
      images: updatedImages
    });

    res.json({
      success: true,
      message: 'Image deleted successfully',
      images: updatedProduct?.images || []
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error deleting product image', 
      error: error.message 
    });
  }
};
