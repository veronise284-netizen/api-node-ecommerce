import { Category, ICategory } from '../models/category.model';

export const createCategory = async (categoryData: Partial<ICategory>): Promise<ICategory> => {
  const category = new Category(categoryData);
  return await category.save();
};

export const getAllCategories = async (filters: any = {}) => {
  const query: any = {};
  
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  
  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }

  return await Category.find(query).sort({ name: 1 });
};

export const getCategoryById = async (id: string): Promise<ICategory | null> => {
  return await Category.findById(id);
};

export const getCategoryBySlug = async (slug: string): Promise<ICategory | null> => {
  return await Category.findOne({ slug });
};

export const updateCategory = async (
  id: string,
  updateData: Partial<ICategory>
): Promise<ICategory | null> => {
  return await Category.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  const result = await Category.findByIdAndDelete(id);
  return !!result;
};

export const countCategories = async (): Promise<number> => {
  return await Category.countDocuments();
};

export const getActiveCategories = async (): Promise<ICategory[]> => {
  return await Category.find({ isActive: true }).sort({ name: 1 });
};
