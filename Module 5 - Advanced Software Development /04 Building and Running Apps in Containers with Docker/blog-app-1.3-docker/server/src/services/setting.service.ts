import prisma from '../db/prisma.js';

export class SettingService {
  static async getSettings() {
    const settings = await prisma.siteSetting.findMany();
    // Convert array of {key, value} into an object { [key]: value } for easier frontend use
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  }

  static async updateSettings(updates: Record<string, string>) {
    // Upsert multiple settings
    const operations = Object.entries(updates).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    );
    
    await prisma.$transaction(operations);
    return this.getSettings();
  }
}
