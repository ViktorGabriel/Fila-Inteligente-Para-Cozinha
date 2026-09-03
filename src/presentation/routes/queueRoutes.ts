import { Router } from 'express';
import { QueueController } from '../controllers/QueueController.js';

export function createQueueRoutes(queueController: QueueController): Router {
  const router = Router();

  router.get('/', queueController.getQueue);

  return router;
}
