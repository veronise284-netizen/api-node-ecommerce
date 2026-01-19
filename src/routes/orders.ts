import { Router } from 'express';
import * as OrderController from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, OrderController.createOrder);



router.get('/', authenticate, OrderController.getMyOrders);


router.get('/:id', authenticate, OrderController.getOrderById);

router.patch('/:id/cancel', authenticate, OrderController.cancelOrder);

export default router;
