import { Product, IProduct } from '../models/product.model';
import { Category } from '../models/category.model';
import mongoose from 'mongoose';

interface ProductFilters {
  category?: string;
  inStock?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

export const createProduct = async (productData: Partial<IProduct>): Promise<IProduct> => {
  const product = new Product(productData);
  return await product.save();
};

const resolveCategoryId = async (category?: string) => {
  if (!category) {
    return undefined;
  }

  if (mongoose.isValidObjectId(category)) {
    return new mongoose.Types.ObjectId(category);
  }

  const categoryDoc = await Category.findOne({ slug: category });
  return categoryDoc ? categoryDoc._id : undefined;
};

export const getAllProducts = async (
  filters: ProductFilters = {},
  pagination: PaginationOptions = {}
) => {
  const query: any = {};
  
  if (filters.category) {
    const categoryId = await resolveCategoryId(filters.category);
    if (!categoryId) {
      return {
        products: [],
        pagination: {
          page: pagination.page || 1,
          limit: pagination.limit || 10,
          total: 0,
          pages: 0
        }
      };
    }
    query.category = categoryId;
  }
  
  if (filters.inStock !== undefined) {
    query.inStock = filters.inStock;
  }
  
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) {
      query.price.$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      query.price.$lte = filters.maxPrice;
    }
  }
  
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } }
    ];
  }

  const page = pagination.page || 1;
  const limit = pagination.limit || 10;
  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('category', 'name slug')
    .populate('createdBy', 'firstName lastName');

  const total = await Product.countDocuments(query);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getProductById = async (id: string): Promise<IProduct | null> => {
  return await Product.findById(id).populate('category', 'name slug');
};

export const updateProduct = async (
  id: string,
  updateData: Partial<IProduct>
): Promise<IProduct | null> => {
  return await Product.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  const result = await Product.findByIdAndDelete(id);
  return !!result;
};


export const createMultipleProducts = async (
  productsData: Partial<IProduct>[]
) => {
  return await Product.insertMany(productsData);
};

export const deleteMultipleProducts = async (ids: string[]): Promise<number> => {
  const result = await Product.deleteMany({ _id: { $in: ids } });
  return result.deletedCount;
};

export const getCategoryStats = async () => {
  return await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        totalQuantity: { $sum: '$quantity' }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        categoryId: '$_id',
        category: '$category.name',
        slug: '$category.slug',
        count: 1,
        avgPrice: { $round: ['$avgPrice', 2] },
        totalQuantity: 1
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

export const getProductsByCategory = async (category: string): Promise<IProduct[]> => {
  const categoryId = await resolveCategoryId(category);
  if (!categoryId) {
    return [];
  }
  return await Product.find({ category: categoryId })
    .sort({ name: 1 })
    .populate('category', 'name slug');
};

export const getInStockProducts = async (): Promise<IProduct[]> => {
  return await Product.find({ inStock: true, quantity: { $gt: 0 } });
};

export const getOutOfStockProducts = async (): Promise<IProduct[]> => {
  return await Product.find({ $or: [{ inStock: false }, { quantity: 0 }] });
};

export const updateStock = async (
  id: string,
  quantity: number
): Promise<IProduct | null> => {
  const inStock = quantity > 0;
  return await Product.findByIdAndUpdate(
    id,
    { quantity, inStock },
    { new: true, runValidators: true }
  );
};
