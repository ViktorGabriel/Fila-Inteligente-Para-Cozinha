import { Router } from 'express';
import { OrderController } from '../controllers/OrderController.js';

export function createOrderRoutes(orderController: OrderController): Router {
  const router = Router();

  router.post('/', orderController.create);
  router.patch('/:id/status', orderController.changeStatus);
  router.get('/:id', orderController.getById);

  return router;
}
