/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { SettingController } from '../controllers/setting.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateSettingSchema } from '../validators/setting.validator.js';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', SettingController.getSettings);
router.patch('/', authenticate, authorize(Role.ADMIN), validate(updateSettingSchema), SettingController.updateSettings);

export default router;
