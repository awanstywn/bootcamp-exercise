/**
 * @file settings.types.ts
 * @description Type Definition for the Shared layer.
 * 
 * @objective 
 * To provide the specific functionality required for settings.types operations.
 * 
 * @relations
 * Functions independently as a standalone module.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

export interface SiteSettings {
  id: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNo: string;
  whatsappNumber: string;
  updatedAt: string;
}
