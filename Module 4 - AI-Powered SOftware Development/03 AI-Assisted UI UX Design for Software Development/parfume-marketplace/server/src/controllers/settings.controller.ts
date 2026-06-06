/**
 * @file settings.controller.ts
 * @description API Controller for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for settings.controller operations.
 * 
 * @relations
 * Interacts with: express, ../services/settings.service.
 * 
 * @howItWorks
 * Extracts request payloads/params, delegates business logic to services, and formats the HTTP response. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Request, Response, NextFunction } from "express";
import * as settingsService from "../services/settings.service";

export async function getSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await settingsService.getSettings();
    res.status(200).json({ success: true, data: { settings } });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await settingsService.updateSettings(req.body);
    res.status(200).json({ success: true, data: { settings } });
  } catch (error) {
    next(error);
  }
}
