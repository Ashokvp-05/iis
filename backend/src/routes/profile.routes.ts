import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', userController.getCurrentUser);
router.patch('/', userController.updateProfile);
router.post('/avatar', userController.updateAvatar);
router.get('/export', userController.exportData);
router.delete('/', userController.deleteAccount);

export default router;
