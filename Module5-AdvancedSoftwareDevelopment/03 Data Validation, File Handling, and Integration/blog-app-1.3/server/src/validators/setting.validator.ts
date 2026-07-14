import { z } from 'zod';

export const updateSettingSchema = z.object({
  aboutHeroTitle: z.string().optional(),
  aboutHeroSubtitle: z.string().optional(),
  aboutMissionText1: z.string().optional(),
  aboutMissionText2: z.string().optional(),
  aboutStat1Value: z.string().optional(),
  aboutStat1Label: z.string().optional(),
  aboutStat2Value: z.string().optional(),
  aboutStat2Label: z.string().optional(),
  aboutStat3Value: z.string().optional(),
  aboutStat3Label: z.string().optional(),
}).strict();
