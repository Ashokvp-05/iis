import { Router } from 'express';
import * as holidayController from '../controllers/holiday.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', holidayController.list);
router.post('/sync', requireRole(['ADMIN']), holidayController.sync);

export default router;
