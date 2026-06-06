/**
 * @file settings.schema.ts
 * @description Validation Schema for the Shared layer.
 * 
 * @objective 
 * To provide the specific functionality required for settings.schema operations.
 * 
 * @relations
 * Interacts with: zod.
 * 
 * @howItWorks
 * Uses Zod to define rigorous shape and type constraints for data payloads, ensuring robust validation. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { z } from "zod";

export const SettingsUpdateSchema = z.object({
  bankName: z.string().max(100).optional(),
  bankAccountName: z.string().max(100).optional(),
  bankAccountNo: z.string().max(50).optional(),
  whatsappNumber: z.string().max(30).optional(),
});

export type SettingsUpdateInput = z.infer<typeof SettingsUpdateSchema>;
