import { Router } from 'express';
import * as OrderController from '../controllers/order.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();


router.get('/orders', authenticate, requireAdmin, OrderController.getAllOrders);

router.get('/orders/statistics', authenticate, requireAdmin, OrderController.getOrderStatistics);

router.patch('/orders/:id/status', authenticate, requireAdmin, OrderController.updateOrderStatus);

export default router;
