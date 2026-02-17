import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', requireRole(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN', 'MANAGER']), userController.getUsers);
router.put('/:id', requireRole(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN']), userController.updateUser);

export default router;
