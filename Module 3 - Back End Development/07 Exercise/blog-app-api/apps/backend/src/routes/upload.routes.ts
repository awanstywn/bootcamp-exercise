// src/routes/upload.routes.ts
// Routes for handling file uploads.
// Endpoint: POST /api/uploads

import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { verifyJWT } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// POST /api/uploads - Upload a single image
// Returns the public URL of the uploaded file
router.post('/', verifyJWT, upload.single('image'), (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    // Construct the public URL
    // Note: In production, this should use a proper domain or cloud storage URL
    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      message: 'File uploaded successfully',
      url: fileUrl,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
