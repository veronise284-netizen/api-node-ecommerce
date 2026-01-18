import { Product, IProduct } from '../models/product.model';

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

export const getAllProducts = async (
  filters: ProductFilters = {},
  pagination: PaginationOptions = {}
) => {
  const query: any = {};
  
  if (filters.category) {
    query.category = filters.category;
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
    .limit(limit);

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
  return await Product.findById(id);
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
      $sort: { count: -1 }
    }
  ]);
};

export const getProductsByCategory = async (category: string): Promise<IProduct[]> => {
  return await Product.find({ category }).sort({ name: 1 });
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
