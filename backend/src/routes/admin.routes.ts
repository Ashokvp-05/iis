import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Middleware to check if user is admin should be added here
router.use(authenticate); // Must be logged in
// Read-Only Routes (Manager Allowed)
router.get('/pending-users', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'VIEWER_ADMIN', 'MANAGER']), adminController.getPendingUsers);
router.get('/stats', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'VIEWER_ADMIN', 'MANAGER']), adminController.getStats);
router.get('/overview', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'VIEWER_ADMIN', 'MANAGER']), adminController.getOverview);
router.get('/roles', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN', 'MANAGER']), adminController.getRoles);
router.get('/audit-logs', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN', 'MANAGER']), adminController.getAuditLogs);

// Write Routes (Manager Restricted)
router.post('/sync/sheets', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN']), adminController.syncToSheets);
router.put('/users/:id/approve', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN']), adminController.approveUser);
router.put('/users/:id/reject', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN']), adminController.rejectUser);

// Settings & Config
router.get('/settings', authorize(['ADMIN', 'SUPER_ADMIN']), adminController.getSettings);
router.patch('/settings', authorize(['ADMIN', 'SUPER_ADMIN']), adminController.updateSettings);

// Advanced User Control
router.patch('/users/:id/status', authorize(['ADMIN', 'SUPER_ADMIN']), adminController.toggleUserStatus);
router.patch('/users/:id/reset-password', authorize(['ADMIN', 'SUPER_ADMIN']), adminController.resetUserPassword);
router.delete('/users/:id', authorize(['ADMIN', 'SUPER_ADMIN']), adminController.deleteUser);

export default router;
