import { Product } from '../models/product.model';
import { User } from '../models/user.model';
import { Category } from '../models/category.model';


export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    const categoryCount = await Category.countDocuments();
    if (categoryCount > 0) {
      console.log('Categories already exist. Skipping category seeding.');
    } else {
      const sampleCategories = [
        { name: 'Electronics', description: 'Electronic devices and accessories' },
        { name: 'Clothing', description: 'Apparel and fashion items' },
        { name: 'Books', description: 'Physical and digital books' },
        { name: 'Home', description: 'Home and kitchen items' },
        { name: 'Sports', description: 'Sports and fitness equipment' }
      ];

      await Category.insertMany(sampleCategories);
      console.log(`Successfully seeded ${sampleCategories.length} categories`);
    }

    // Seed users first
    const userCount = await User.countDocuments();
    let vendorUsers: any[] = [];
    
    if (userCount > 0) {
      console.log('Users already exist. Skipping user seeding.');
      vendorUsers = await User.find({ role: 'vendor' }).limit(2);
    } else {
      const sampleUsers = [
        {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: 'Admin123!',
          age: 30,
          status: 'active',
          role: 'admin'
        },
        {
          firstName: 'Veronise',
          lastName: 'AKIM',
          email: 'veronise.akim@example.com',
          password: 'Password123',
          age: 26,
          status: 'active',
          role: 'vendor'
        },
        {
          firstName: 'Jane',
          lastName: 'Kea',
          email: 'jane.kea@example.com',
          password: 'SecurePass456',
          age: 32,
          status: 'active',
          role: 'vendor'
        },
        {
          firstName: 'Alice',
          lastName: 'kamanzi',
          email: 'alice.kamanzi@example.com',
          password: 'Alice2024!',
          age: 25,
          status: 'pending',
          role: 'vendor'
        },
        {
          firstName: 'Bob',
          lastName: 'Williams',
          email: 'bob.williams@example.com',
          password: 'BobSecure99',
          age: 45,
          status: 'active',
          role: 'admin'
        },
        {
          firstName: 'Eva',
          lastName: 'uwineza',
          email: 'eva.uwineza@example.com',
          password: 'EvaBrown123',
          age: 29,
          status: 'inactive',
          role: 'vendor'
        },
        {
          firstName: 'John',
          lastName: 'Customer',
          email: 'john.customer@example.com',
          password: 'Customer123!',
          age: 28,
          status: 'active',
          role: 'customer'
        },
        {
          firstName: 'Sarah',
          lastName: 'Buyer',
          email: 'sarah.buyer@example.com',
          password: 'Buyer123!',
          age: 24,
          status: 'active',
          role: 'customer'
        },
        {
          firstName: 'Mike',
          lastName: 'Shopper',
          email: 'mike.shopper@example.com',
          password: 'Shopper123!',
          age: 35,
          status: 'active',
          role: 'customer'
        }
      ];

      const createdUsers = await User.create(sampleUsers);
      vendorUsers = createdUsers.filter(u => u.role === 'vendor').slice(0, 2);
      console.log(`Successfully seeded ${sampleUsers.length} users (2 admins, 4 vendors, 3 customers)`);
    }

    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log('Products already exist. Skipping product seeding.');
    } else {
      const sampleProducts = [
        {
          name: 'Laptop Pro 15',
          price: 1299.99,
          description: 'High-performance laptop for professionals',
          category: 'electronics',
          inStock: true,
          quantity: 25,
          createdBy: vendorUsers[0]?._id
        },
        {
          name: 'Wireless Mouse',
          price: 29.99,
          description: 'Ergonomic wireless mouse with USB receiver',
          category: 'electronics',
          inStock: true,
          quantity: 100,
          createdBy: vendorUsers[0]?._id
        },
        {
          name: 'Cotton T-Shirt',
          price: 19.99,
          description: 'Comfortable cotton t-shirt in various colors',
          category: 'clothing',
          inStock: true,
          quantity: 200,
          createdBy: vendorUsers[1]?._id
        },
        {
          name: 'Running Shoes',
          price: 89.99,
          description: 'Professional running shoes with excellent cushioning',
          category: 'sports',
          inStock: true,
          quantity: 50,
          createdBy: vendorUsers[1]?._id
        },
        {
          name: 'JavaScript: The Good Parts',
          price: 24.99,
          description: 'Essential JavaScript programming guide',
          category: 'books',
          inStock: true,
          quantity: 30,
          createdBy: vendorUsers[0]?._id
        },
        {
          name: 'Coffee Maker',
          price: 79.99,
          description: 'Automatic coffee maker with timer',
          category: 'home',
          inStock: true,
          quantity: 15,
          createdBy: vendorUsers[1]?._id
        },
        {
          name: 'Desk Lamp',
          price: 34.99,
          description: 'LED desk lamp with adjustable brightness',
          category: 'home',
          inStock: false,
          quantity: 0,
          createdBy: vendorUsers[0]?._id
        },
        {
          name: 'Yoga Mat',
          price: 29.99,
          description: 'Non-slip yoga mat with carrying strap',
          category: 'sports',
          inStock: true,
          quantity: 75,
          createdBy: vendorUsers[1]?._id
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log(`Successfully seeded ${sampleProducts.length} products (distributed among vendors)`);
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};


export const clearDatabase = async () => {
  try {
    console.log('Clearing database...');
    
    await Category.deleteMany({});
    console.log(' Categories cleared');
    
    await Product.deleteMany({});
    console.log('Products cleared');
    
    await User.deleteMany({});
    console.log('Users cleared');
    
    console.log('Database cleared successfully!');
  } catch (error) {
    console.error(' Error clearing database:', error);
    throw error;
  }
};
