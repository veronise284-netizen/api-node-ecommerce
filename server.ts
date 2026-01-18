import app from './src/routes/app';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.connects';

dotenv.config();

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Then start the server
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
