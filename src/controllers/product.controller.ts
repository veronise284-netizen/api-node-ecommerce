import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as ProductService from '../services/product.service';
import { deleteFile, getFileUrl } from '../middlewares/upload.middleware';

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
