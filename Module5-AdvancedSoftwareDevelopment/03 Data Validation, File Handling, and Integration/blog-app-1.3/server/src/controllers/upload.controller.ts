import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service.js';
import { BadRequestError } from '../utils/errors.js';

export class UploadController {
  static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new BadRequestError('No image provided');
      const url = await UploadService.uploadImage(req.file.buffer);
      res.json({ url });
    } catch (error) {
      next(error);
    }
  }
}
