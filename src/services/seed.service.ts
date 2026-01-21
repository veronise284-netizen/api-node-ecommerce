import { Product } from '../models/product.model';
import { User } from '../models/user.model';
import { Category } from '../models/category.model';
import { Review } from '../models/review.model';
import { Cart } from '../models/cart.model';
import { Order } from '../models/order.model';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Review.deleteMany({}),
      Order.deleteMany({}),
      Cart.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({})
    ]);
    console.log('✅ Database cleared\n');

    // Seed categories
    console.log('📁 Seeding categories...');
    const categoryData = [
      { name: 'Electronics', description: 'Electronic devices and accessories', slug: 'electronics' },
      { name: 'Clothing', description: 'Apparel and fashion items', slug: 'clothing' },
      { name: 'Books', description: 'Physical and digital books', slug: 'books' },
      { name: 'Home', description: 'Home and kitchen items', slug: 'home' },
      { name: 'Sports', description: 'Sports and fitness equipment', slug: 'sports' }
    ];
    const categories = await Category.insertMany(categoryData);
    const categoryBySlug: { [key: string]: string } = {};
    for (const category of categories) {
      categoryBySlug[category.slug] = category._id.toString();
    }
    console.log(`✅ Created ${categories.length} categories\n`);

    // Seed users
    console.log('👥 Seeding users...');
    const users = await User.create([
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
        lastName: 'Kamanzi',
        email: 'alice.kamanzi@example.com',
        password: 'Alice2024!',
        age: 25,
        status: 'active',
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
    ]);

    const admin = users[0];
    const vendors = users.filter(u => u.role === 'vendor');
    const customers = users.filter(u => u.role === 'customer');
    console.log(`✅ Created ${users.length} users (1 admin, ${vendors.length} vendors, ${customers.length} customers)\n`);

    // Seed products
    console.log('📦 Seeding products...');
    const products = await Product.insertMany([
      // Electronics - High price
      {
        name: 'MacBook Pro 16"',
        price: 2499.99,
        description: 'High-performance laptop with M2 chip and 16GB RAM',
        category: categoryBySlug['electronics'],
        inStock: true,
        quantity: 15,
        createdBy: vendors[0]._id
      },
      {
        name: 'iPhone 15 Pro Max',
        price: 1999.99,
        description: 'Latest iPhone with advanced camera system',
        category: categoryBySlug['electronics'],
        inStock: true,
        quantity: 30,
        createdBy: vendors[0]._id
      },
      {
        name: 'Gaming Laptop RTX 4080',
        price: 1799.99,
        description: 'High-end gaming laptop with RGB keyboard',
        category: categoryBySlug['electronics'],
        inStock: true,
        quantity: 20,
        createdBy: vendors[1]._id
      },
      {
        name: '4K Monitor 32"',
        price: 599.99,
        description: 'Ultra HD 4K monitor with HDR support',
        category: categoryBySlug['electronics'],
        inStock: true,
        quantity: 45,
        createdBy: vendors[0]._id
      },
      {
        name: 'Wireless Earbuds Pro',
        price: 299.99,
        description: 'Premium wireless earbuds with noise cancellation',
        category: categoryBySlug['electronics'],
        inStock: true,
        quantity: 80,
        createdBy: vendors[1]._id
      },
      // Electronics - Medium price
      {
        name: 'Mechanical Keyboard',
        price: 149.99,
        description: 'RGB mechanical keyboard with blue switches',
        category: categoryBySlug['electronics'],
        inStock: true,
        quantity: 60,
        createdBy: vendors[2]._id
      },
      {
        name: 'Wireless Mouse Gaming',
        price: 79.99,
        description: 'High-precision wireless gaming mouse',
        category: categoryBySlug['electronics'],
        inStock: true,
        quantity: 100,
        createdBy: vendors[0]._id
      },
      {
        name: 'USB-C Hub 7-in-1',
        price: 49.99,
        description: 'Multi-port USB-C hub for laptops',
        category: categoryBySlug['electronics'],
        inStock: true,
        quantity: 150,
        createdBy: vendors[1]._id
      },
      // Electronics - Low price
      {
        name: 'USB-C Cable 6ft',
        price: 12.99,
        description: 'Fast charging USB-C cable',
        category: categoryBySlug['electronics'],
        inStock: true,
        quantity: 500,
        createdBy: vendors[2]._id
      },
      {
        name: 'Phone Screen Protector',
        price: 9.99,
        description: 'Tempered glass screen protector',
        category: categoryBySlug['electronics'],
        inStock: true,
        quantity: 300,
        createdBy: vendors[0]._id
      },
      // Electronics - Low stock items
      {
        name: 'Limited Edition Headphones',
        price: 399.99,
        description: 'Premium over-ear headphones',
        category: categoryBySlug['electronics'],
        inStock: true,
        quantity: 5,
        createdBy: vendors[1]._id
      },
      {
        name: 'Vintage Camera',
        price: 899.99,
        description: 'Collectible vintage camera',
        category: categoryBySlug['electronics'],
        inStock: true,
        quantity: 3,
        createdBy: vendors[2]._id
      },
      // Clothing
      {
        name: 'Premium Leather Jacket',
        price: 299.99,
        description: 'Genuine leather jacket in black',
        category: categoryBySlug['clothing'],
        inStock: true,
        quantity: 35,
        createdBy: vendors[1]._id
      },
      {
        name: 'Designer Jeans',
        price: 89.99,
        description: 'Slim fit designer jeans',
        category: categoryBySlug['clothing'],
        inStock: true,
        quantity: 120,
        createdBy: vendors[2]._id
      },
      {
        name: 'Cotton T-Shirt Pack',
        price: 29.99,
        description: 'Pack of 3 premium cotton t-shirts',
        category: categoryBySlug['clothing'],
        inStock: true,
        quantity: 200,
        createdBy: vendors[0]._id
      },
      {
        name: 'Running Shoes',
        price: 129.99,
        description: 'Professional running shoes',
        category: categoryBySlug['clothing'],
        inStock: true,
        quantity: 75,
        createdBy: vendors[1]._id
      },
      {
        name: 'Winter Coat',
        price: 199.99,
        description: 'Warm winter coat with hood',
        category: categoryBySlug['clothing'],
        inStock: true,
        quantity: 8,
        createdBy: vendors[2]._id
      },
      // Books
      {
        name: 'JavaScript: The Good Parts',
        price: 39.99,
        description: 'Essential JavaScript programming book',
        category: categoryBySlug['books'],
        inStock: true,
        quantity: 45,
        createdBy: vendors[0]._id
      },
      {
        name: 'Clean Code',
        price: 44.99,
        description: 'A handbook of agile software craftsmanship',
        category: categoryBySlug['books'],
        inStock: true,
        quantity: 60,
        createdBy: vendors[1]._id
      },
      {
        name: 'The Pragmatic Programmer',
        price: 49.99,
        description: 'Your journey to mastery',
        category: categoryBySlug['books'],
        inStock: true,
        quantity: 40,
        createdBy: vendors[2]._id
      },
      {
        name: 'Design Patterns',
        price: 54.99,
        description: 'Elements of reusable object-oriented software',
        category: categoryBySlug['books'],
        inStock: true,
        quantity: 30,
        createdBy: vendors[0]._id
      },
      // Home
      {
        name: 'Coffee Maker Deluxe',
        price: 149.99,
        description: 'Programmable coffee maker with thermal carafe',
        category: categoryBySlug['home'],
        inStock: true,
        quantity: 55,
        createdBy: vendors[1]._id
      },
      {
        name: 'Blender Pro',
        price: 89.99,
        description: 'High-speed blender for smoothies',
        category: categoryBySlug['home'],
        inStock: true,
        quantity: 70,
        createdBy: vendors[2]._id
      },
      {
        name: 'Vacuum Cleaner Robot',
        price: 399.99,
        description: 'Smart robot vacuum with app control',
        category: categoryBySlug['home'],
        inStock: true,
        quantity: 25,
        createdBy: vendors[0]._id
      },
      {
        name: 'Air Purifier',
        price: 249.99,
        description: 'HEPA air purifier for large rooms',
        category: categoryBySlug['home'],
        inStock: true,
        quantity: 7,
        createdBy: vendors[1]._id
      },
      // Sports
      {
        name: 'Yoga Mat Premium',
        price: 49.99,
        description: 'Extra thick yoga mat with carry strap',
        category: categoryBySlug['sports'],
        inStock: true,
        quantity: 90,
        createdBy: vendors[2]._id
      },
      {
        name: 'Dumbbell Set',
        price: 299.99,
        description: 'Adjustable dumbbell set 5-50 lbs',
        category: categoryBySlug['sports'],
        inStock: true,
        quantity: 35,
        createdBy: vendors[0]._id
      },
      {
        name: 'Resistance Bands Set',
        price: 24.99,
        description: 'Set of 5 resistance bands',
        category: categoryBySlug['sports'],
        inStock: true,
        quantity: 150,
        createdBy: vendors[1]._id
      },
      {
        name: 'Treadmill Pro',
        price: 1299.99,
        description: 'Professional treadmill with touch screen',
        category: categoryBySlug['sports'],
        inStock: true,
        quantity: 6,
        createdBy: vendors[2]._id
      },
      {
        name: 'Basketball Official',
        price: 34.99,
        description: 'Official size basketball',
        category: categoryBySlug['sports'],
        inStock: true,
        quantity: 80,
        createdBy: vendors[0]._id
      }
    ]);
    console.log(`✅ Created ${products.length} products across all categories\n`);

    // Seed reviews
    console.log('⭐ Seeding reviews...');
    const reviews = await Review.insertMany([
      {
        product: products[0]._id,
        user: customers[0]._id,
        rating: 5,
        comment: 'Excellent laptop! Fast and reliable for all my development work.'
      },
      {
        product: products[0]._id,
        user: customers[1]._id,
        rating: 4,
        comment: 'Great performance but a bit pricey. Worth it for professionals.'
      },
      {
        product: products[1]._id,
        user: customers[2]._id,
        rating: 5,
        comment: 'Best phone I\'ve ever owned. Camera quality is amazing!'
      },
      {
        product: products[2]._id,
        user: customers[0]._id,
        rating: 5,
        comment: 'Perfect for gaming. Runs all games at ultra settings smoothly.'
      },
      {
        product: products[4]._id,
        user: customers[1]._id,
        rating: 4,
        comment: 'Sound quality is excellent. Noise cancellation works well.'
      },
      {
        product: products[5]._id,
        user: customers[2]._id,
        rating: 5,
        comment: 'Best keyboard I\'ve used. The mechanical switches feel great!'
      },
      {
        product: products[12]._id,
        user: customers[0]._id,
        rating: 5,
        comment: 'High quality leather. Fits perfectly and looks stylish.'
      },
      {
        product: products[14]._id,
        user: customers[1]._id,
        rating: 4,
        comment: 'Good quality t-shirts. Very comfortable to wear.'
      },
      {
        product: products[17]._id,
        user: customers[2]._id,
        rating: 5,
        comment: 'Must-read for any JavaScript developer. Clear and concise.'
      },
      {
        product: products[18]._id,
        user: customers[0]._id,
        rating: 5,
        comment: 'This book changed how I write code. Highly recommended!'
      }
    ]);
    console.log(`✅ Created ${reviews.length} reviews\n`);

    console.log('✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${products.length} products`);
    console.log(`   - ${reviews.length} reviews`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

export const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing database...');
    
    await Promise.all([
      Review.deleteMany({}),
      Order.deleteMany({}),
      Cart.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({})
    ]);
    
    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Clear failed:', error);
    throw error;
  }
};
