import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.config';

// Check if Cloudinary is configured
const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);

// Cloudinary storage configuration
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  } as any
});

// Local disk storage configuration (fallback)
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// File filter for validation
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, and WEBP images are allowed.'));
  }
};

// Use Cloudinary if configured, otherwise use local storage
export const upload = multer({
  storage: useCloudinary ? cloudinaryStorage : diskStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024, 
  }
});

// Delete file from Cloudinary or local storage
export const deleteFile = async (fileUrl: string): Promise<void> => {
  if (useCloudinary && fileUrl.includes('cloudinary.com')) {
    // Extract public_id from Cloudinary URL
    const matches = fileUrl.match(/\/ecommerce\/([^/.]+)/);
    if (matches && matches[1]) {
      const publicId = `ecommerce/${matches[1]}`;
      await cloudinary.uploader.destroy(publicId);
      console.log('☁️  Deleted from Cloudinary:', publicId);
    }
  } else {
    // Delete from local storage
    const filename = path.basename(fileUrl);
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️  Deleted from local storage:', filename);
    }
  }
};

// Get file URL - Cloudinary URLs are already complete, local files need full URL
export const getFileUrl = (req: any, file: Express.Multer.File & { path?: string }): string => {
  if (useCloudinary && file.path) {
    // Cloudinary provides the full URL in file.path
    return file.path;
  } else {
    // Local storage - construct URL
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/uploads/${file.filename}`;
  }
};
