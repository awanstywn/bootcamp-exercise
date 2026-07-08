import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { UserController } from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateProfileSchema } from '../validators/user.validator.js';

const router = Router();

router.post('/role-request', authenticate, UserController.requestRole);
router.get('/role-request', authenticate, UserController.getRoleRequestStatus);
router.patch('/me', authenticate, validate(updateProfileSchema), UserController.updateProfile);

export default router;
