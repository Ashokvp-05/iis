
import { Router } from 'express';
import * as payrollController from '../controllers/payroll.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// ---------------------------------------------------------------------
// 🔹 EMPLOYEE ACCESS (View Own Payslips)
// ---------------------------------------------------------------------
router.get('/my-payslips', authorize(['EMPLOYEE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN', 'HR_ADMIN']), payrollController.getMyPayslips);


// ---------------------------------------------------------------------
// 🔹 MANAGER ACCESS (Read-Only View)
// ---------------------------------------------------------------------
// Managers can view batch details and team summary, but cannot modify.
const VIEW_ROLES = ['MANAGER', 'ADMIN', 'SUPER_ADMIN', 'HR_ADMIN'];

router.get('/batches', authorize(VIEW_ROLES), payrollController.getAllBatches);
router.get('/batches/:batchId', authorize(VIEW_ROLES), payrollController.getBatch);


// ---------------------------------------------------------------------
// 🔹 ADMIN ACCESS (Full Control)
// ---------------------------------------------------------------------
// Only Admins can create batches, generate payslips, and change status.
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN'];

router.post('/batches', authorize(ADMIN_ROLES), payrollController.createBatch);
router.post('/batches/:batchId/generate', authorize(ADMIN_ROLES), payrollController.generatePayslips);
router.put('/batches/:batchId/status', authorize(ADMIN_ROLES), payrollController.updateBatchStatus);

export default router;
