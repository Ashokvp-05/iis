
import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/employee', authenticate as any, dashboardController.getEmployeeDashboard);
router.get('/admin-stats', authenticate as any, dashboardController.getAdminStats);

export default router;
