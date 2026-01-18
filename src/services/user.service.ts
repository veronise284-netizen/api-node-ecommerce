import { User, IUser } from '../models/user.model';

export const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const user = new User(userData);
  return await user.save();
};

export const getAllUsers = async (filters: any = {}) => {
  const query: any = {};
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.search) {
    query.$or = [
      { firstName: { $regex: filters.search, $options: 'i' } },
      { lastName: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } }
    ];
  }

  return await User.find(query)
    .select('-password')  
    .sort({ createdAt: -1 });
};

export const getUserById = async (id: string): Promise<IUser | null> => {
  return await User.findById(id).select('-password');
};

export const getUserByEmail = async (email: string): Promise<IUser | null> => {
  return await User.findOne({ email });
};

export const updateUser = async (
  id: string,
  updateData: Partial<IUser>
): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const result = await User.findByIdAndDelete(id);
  return !!result;
};

export const getUsersByStatus = async (status: 'active' | 'inactive' | 'pending'): Promise<IUser[]> => {
  return await User.find({ status }).select('-password');
};

export const countUsers = async (): Promise<number> => {
  return await User.countDocuments();
};

export const updateUserStatus = async (
  id: string,
  status: 'active' | 'inactive' | 'pending'
): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).select('-password');
};
