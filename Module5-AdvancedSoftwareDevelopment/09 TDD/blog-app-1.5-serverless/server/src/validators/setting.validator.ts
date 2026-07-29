/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
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
