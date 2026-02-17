import { Router } from 'express';
import * as kudosController from '../controllers/kudos.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Get all kudos (Public Wall)
router.get('/', kudosController.getAllKudos);

// Give kudos
router.post('/', kudosController.giveKudos);

// Get my received kudos
router.get('/my', kudosController.getMyKudos);

export default router;
