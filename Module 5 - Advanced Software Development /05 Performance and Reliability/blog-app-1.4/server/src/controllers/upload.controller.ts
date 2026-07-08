import { Request, Response } from 'express';
import { UploadService } from '../services/upload.service.js';
import { BadRequestError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class UploadController {
  static uploadImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new BadRequestError('No image provided');
    const url = await UploadService.uploadImage(req.file.buffer);
    res.json({ url });
  });
}
