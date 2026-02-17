import { Router } from 'express';
import * as payslipController from '../controllers/payslip.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

// Employee actions
router.get('/my', payslipController.getMyPayslips);
router.get('/:id/download', payslipController.downloadPayslip);

// Admin / Manager actions
// Allow broad access for basic listing, specific actions guarded below
router.get('/all', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'MANAGER']), payslipController.getAllPayslips);

// Admin Only
router.post('/upload', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN']), upload.single('file'), payslipController.uploadPayslip);
router.post('/generate', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN']), payslipController.generatePayslip);
router.patch('/:id/release', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN']), payslipController.releasePayslip);
router.post('/bulk-release', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN']), payslipController.bulkRelease);
router.delete('/:id', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN']), payslipController.deletePayslip);
router.put('/:id', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN']), payslipController.updatePayslip);

export default router;
