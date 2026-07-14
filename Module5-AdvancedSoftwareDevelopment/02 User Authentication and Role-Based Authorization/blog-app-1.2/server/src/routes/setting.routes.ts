import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { SettingController } from '../controllers/setting.controller.js';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', SettingController.getSettings);
router.patch('/', authenticate, authorize(Role.ADMIN), SettingController.updateSettings);

export default router;
