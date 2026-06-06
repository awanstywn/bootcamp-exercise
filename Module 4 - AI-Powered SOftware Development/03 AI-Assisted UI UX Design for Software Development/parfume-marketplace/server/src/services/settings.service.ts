/**
 * @file settings.service.ts
 * @description Business Logic Service for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for settings.service operations.
 * 
 * @relations
 * Interacts with: ../lib/prisma, shared.
 * 
 * @howItWorks
 * Interacts directly with the database (e.g., Prisma) or external APIs to execute core application rules. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import prisma from "../lib/prisma";
import type { SettingsUpdateInput } from "shared";

const DEFAULT_SETTINGS = {
  id: "singleton",
  bankName: "ABC",
  bankAccountName: "test",
  bankAccountNo: "1234567890",
  whatsappNumber: "628888888888",
};

export async function getSettings() {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: DEFAULT_SETTINGS,
    });
  }

  return settings;
}

export async function updateSettings(data: SettingsUpdateInput) {
  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: {
      ...DEFAULT_SETTINGS,
      ...data,
    },
  });

  return settings;
}
