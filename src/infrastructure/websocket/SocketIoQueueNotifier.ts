import { Server as SocketIoServer } from 'socket.io';
import { IQueueNotifier } from '../../domain/ports/IQueueNotifier.js';
import { Order } from '../../domain/entities/Order.js';
import { PriorityCalculatorService } from '../../application/services/PriorityCalculatorService.js';
import { OrderQueueItemDTO } from '../../application/dtos/OrderQueueDTO.js';

export class SocketIoQueueNotifier implements IQueueNotifier {
  private io?: SocketIoServer;

  public setSocketServer(io: SocketIoServer): void {
    this.io = io;
  }

  async notifyQueueUpdated(orders: Order[]): Promise<void> {
    if (!this.io) {
      return;
    }

    const now = new Date();
    const prioritizedQueue = PriorityCalculatorService.sortQueue(orders, now);

    const payload: OrderQueueItemDTO[] = prioritizedQueue.map(
      ({ order, remainingMinutes, priorityTier }) => ({
        id: order.id,
        customerName: order.customerName,
        status: order.status,
        receivedAt: order.receivedAt.toISOString(),
        slaDeliveryMinutes: order.slaDeliveryMinutes,
        maxPrepTimeMinutes: order.maxPrepTimeMinutes,
        remainingMinutes,
        priorityTier,
        items: order.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          prepTimeMinutes: item.prepTimeMinutes,
        })),
      })
    );

    this.io.emit('queue:updated', payload);
  }
}
