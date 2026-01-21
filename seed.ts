import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './src/config/db.connects';
import { seedDatabase, clearDatabase } from './src/services/seed.service';

dotenv.config();

const runSeeder = async () => {
  try {
    // Connect to database
    await connectDB();

    // Get command line argument
    const command = process.argv[2];

    switch (command) {
      case 'seed':
        await seedDatabase();
        break;
      case 'clear':
        await clearDatabase();
        break;
      case 'reset':
        await clearDatabase();
        await seedDatabase();
        break;
      default:
        console.log('\nAvailable commands:');
        console.log('  npm run seed       - Seed the database with sample data');
        console.log('  npm run seed:clear - Clear all data from database');
        console.log('  npm run seed:reset - Clear and reseed the database\n');
    }

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error);
    
    // Close connection on error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
};

runSeeder();
