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
const TICK_INTERVAL_MS = process.env.QUEUE_TICK_INTERVAL_MS ? Number(process.env.QUEUE_TICK_INTERVAL_MS) : 15000;

// Injeção de dependências (Composition Root)
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

// Queue Ticker: Recalcula periodicamente a fila para refletir o envelhecimento dos pedidos e SLA
const ticker = setInterval(async () => {
  try {
    const pendingOrders = await orderRepository.findAllPending();
    if (pendingOrders.length > 0) {
      await queueNotifier.notifyQueueUpdated(pendingOrders);
    }
  } catch (error) {
    console.error('[Queue Ticker] Erro ao recalcular fila periódica:', error);
  }
}, TICK_INTERVAL_MS);

server.listen(PORT, () => {
  console.log(`🍳 Kitchen Display Server (KDS) running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready on port ${PORT}`);
  console.log(`⏱️ Queue dynamic SLA ticker active (interval: ${TICK_INTERVAL_MS}ms)`);
});

const shutdown = () => {
  clearInterval(ticker);
  io.close();
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { server, app, io };
