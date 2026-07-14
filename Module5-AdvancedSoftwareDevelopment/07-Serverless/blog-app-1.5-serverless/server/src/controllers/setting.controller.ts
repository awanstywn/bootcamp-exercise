/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
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
