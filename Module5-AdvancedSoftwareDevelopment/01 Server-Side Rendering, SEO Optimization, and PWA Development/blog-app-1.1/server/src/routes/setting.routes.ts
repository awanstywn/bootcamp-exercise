import { Router } from 'express';
import { SettingController } from '../controllers/setting.controller.js';

const router = Router();

router.get('/', SettingController.getSettings);
router.patch('/', SettingController.updateSettings);

export default router;
