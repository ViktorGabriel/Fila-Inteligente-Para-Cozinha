import express, { Express } from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { errorHandler } from '../../presentation/middlewares/errorHandler.js';
import { createOrderRoutes } from '../../presentation/routes/orderRoutes.js';
import { createQueueRoutes } from '../../presentation/routes/queueRoutes.js';
import { OrderController } from '../../presentation/controllers/OrderController.js';
import { QueueController } from '../../presentation/controllers/QueueController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.resolve(__dirname, '../../../public');

export interface AppDependencies {
  orderController: OrderController;
  queueController: QueueController;
}

export function createApp(dependencies: AppDependencies): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.static(publicPath));

  app.use('/api/orders', createOrderRoutes(dependencies.orderController));
  app.use('/api/queue', createQueueRoutes(dependencies.queueController));

  app.use(errorHandler);

  return app;
}
