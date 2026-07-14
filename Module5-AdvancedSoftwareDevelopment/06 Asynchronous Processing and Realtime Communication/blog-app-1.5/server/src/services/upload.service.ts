/**
 * @fileoverview Upload Service
 * @objective Handle image uploads to Cloudinary and provide multer middleware for processing multipart/form-data.
 * @risk Allowing arbitrary file uploads without validation (e.g. mimetypes and file size) can lead to malware hosting or storage exhaustion.
 * @relations Used by `upload.routes.ts`. Depends on `cloudinary` and `multer`.
 * @logic
 * - Configures Cloudinary with credentials from `env.ts`.
 * - Sets up a `multer` middleware using `memoryStorage` (files are kept in RAM, not disk) with a 5MB limit and an image-only mimetype filter.
 * - `uploadImage`: Takes the file buffer from memory and streams it directly to Cloudinary, returning the secure URL upon success.
 */
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import multer from 'multer';
import { BadRequestError } from '../utils/errors.js';
import path from 'path';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = file.mimetype.startsWith('image/');
    const allowedExtensions = /jpeg|jpg|png|gif|webp/i.test(path.extname(file.originalname));

    if (allowedMimeTypes && allowedExtensions) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
  },
});

export class UploadService {
  static async uploadImage(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'blog-app',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        },
      );
      uploadStream.end(buffer);
    });
  }
}
