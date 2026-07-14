/**
 * @fileoverview Upload Routes
 * @objective Expose endpoints for securely uploading media files (images) to the backend.
 * @risk Unauthenticated or unthrottled uploads can lead to massive bandwidth or storage bills (Cloudinary).
 * @relations Mounted under `/api/upload`. Uses `UploadService` and `uploadMiddleware` (multer).
 * @logic
 * - Defines `POST /image`.
 * - Requires authentication and minimum AUTHOR role.
 * - Uses multer `uploadMiddleware.single('image')` to parse the incoming multipart form data.
 * - Passes the parsed file buffer to the `UploadService` to send to Cloudinary.
 */
import { Router } from 'express';
import { uploadMiddleware } from '../services/upload.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { UploadController } from '../controllers/upload.controller.js';
import { rateLimit } from 'express-rate-limit';
import { Role } from '@prisma/client';

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 image uploads per hour to prevent Cloudinary abuse
  message: { error: 'Upload limit reached. Please try again later.' },
});

router.post(
  '/image',
  uploadLimiter,
  authenticate,
  authorize(Role.ADMIN, Role.AUTHOR, Role.SUBSCRIBER),
  uploadMiddleware.single('image'),
  UploadController.uploadImage
);

export default router;
