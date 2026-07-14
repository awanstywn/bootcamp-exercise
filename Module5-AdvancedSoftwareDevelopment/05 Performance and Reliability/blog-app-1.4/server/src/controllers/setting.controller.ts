import { Request, Response } from 'express';
import { SettingService } from '../services/setting.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class SettingController {
  static getSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingService.getSettings();
    res.json(settings);
  });

  static updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingService.updateSettings(req.body);
    res.json(settings);
  });
}
