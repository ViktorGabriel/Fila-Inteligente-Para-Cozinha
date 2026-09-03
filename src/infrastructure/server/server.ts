import 'dotenv/config';
import http from 'node:http';
import { Server as SocketIoServer } from 'socket.io';
import { createApp } from './app.js';
import { PrismaOrderRepository } from '../repositories/PrismaOrderRepository.js';
import { SocketIoQueueNotifier } from '../websocket/SocketIoQueueNotifier.js';
import { CreateOrderUseCase } from '../../application/use-cases/CreateOrderUseCase.js';
import { ChangeOrderStatusUseCase } from '../../application/use-cases/ChangeOrderStatusUseCase.js';
import { GetKitchenQueueUseCase } from '../../application/use-cases/GetKitchenQueueUseCase.js';
import { GetOrderByIdUseCase } from '../../application/use-cases/GetOrderByIdUseCase.js';
import { OrderController } from '../../presentation/controllers/OrderController.js';
import { QueueController } from '../../presentation/controllers/QueueController.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3333;

// Injeção de dependências
const orderRepository = new PrismaOrderRepository();
const queueNotifier = new SocketIoQueueNotifier();

const createOrderUseCase = new CreateOrderUseCase(orderRepository, queueNotifier);
const changeOrderStatusUseCase = new ChangeOrderStatusUseCase(orderRepository, queueNotifier);
const getKitchenQueueUseCase = new GetKitchenQueueUseCase(orderRepository);
const getOrderByIdUseCase = new GetOrderByIdUseCase(orderRepository);

const orderController = new OrderController(
  createOrderUseCase,
  changeOrderStatusUseCase,
  getOrderByIdUseCase
);
const queueController = new QueueController(getKitchenQueueUseCase);

const app = createApp({
  orderController,
  queueController,
});

const server = http.createServer(app);

const io = new SocketIoServer(server, {
  cors: {
    origin: '*',
  },
});

queueNotifier.setSocketServer(io);

io.on('connection', async socket => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  try {
    const currentQueue = await getKitchenQueueUseCase.execute();
    socket.emit('queue:updated', currentQueue);
  } catch (error) {
    console.error('Failed to send initial queue to client:', error);
  }

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🍳 Kitchen Display Server (KDS) running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready on port ${PORT}`);
});

export { server, app, io };
