import { Router } from 'express';
import * as leaveController from '../controllers/leave.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/request', leaveController.createRequest);
router.get('/my-requests', leaveController.getMyRequests);
router.get('/balance', leaveController.getBalance);
router.get('/all', requireRole(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN', 'VIEWER_ADMIN', 'MANAGER']), leaveController.getAllRequests);
router.put('/:id/approve', requireRole(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN', 'MANAGER']), leaveController.approveRequest);
router.put('/:id/reject', requireRole(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN', 'MANAGER']), leaveController.rejectRequest);

export default router;
