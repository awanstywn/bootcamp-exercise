/**
 * @file addresses.controller.ts
 * @description API Controller for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for addresses.controller operations.
 * 
 * @relations
 * Interacts with: express, ../services/addresses.service, zod.
 * 
 * @howItWorks
 * Extracts request payloads/params, delegates business logic to services, and formats the HTTP response. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Request, Response, NextFunction } from "express";
import * as addressService from "../services/addresses.service";
import { z } from "zod";

const AddressSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required").max(100),
  province: z.string().min(1, "Province is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(10),
  isDefault: z.boolean().optional(),
});

export async function getAddresses(req: Request, res: Response, next: NextFunction) {
  try {
    const addresses = await addressService.getUserAddresses((req as any).user.id);
    res.status(200).json({ success: true, data: { addresses } });
  } catch (error) {
    next(error);
  }
}

export async function createAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = AddressSchema.parse(req.body);
    const address = await addressService.createAddress((req as any).user.id, validated);
    res.status(201).json({ success: true, data: { address } });
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await addressService.deleteAddress((req as any).user.id, req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function setDefaultAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const address = await addressService.setDefaultAddress((req as any).user.id, req.params.id);
    res.status(200).json({ success: true, data: { address } });
  } catch (error) {
    next(error);
  }
}
