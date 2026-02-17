
import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Create ticket (All authenticated users)
router.post('/', ticketController.createTicket);

// Get ticket analytics (must be before /:id routes if any, though here / is generic)
// However, getTickets is /, so analytics should be /analytics
router.get('/analytics', ticketController.getTicketAnalytics);

// Get tickets (Users see own, Admins see all)
router.get('/', ticketController.getTickets);

// Update status (Admins only)
router.patch('/:id/status', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN']), ticketController.updateTicketStatus);

// Assign ticket (Admins only)
router.patch('/:id/assign', authorize(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN']), ticketController.assignTicket);

// Add comment (All authenticated users for now)
router.post('/:id/comments', ticketController.addComment);

export default router;
