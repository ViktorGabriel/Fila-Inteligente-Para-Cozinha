import { IOrderRepository } from '../../domain/ports/IOrderRepository.js';
import { PriorityCalculatorService } from '../services/PriorityCalculatorService.js';
import { OrderQueueItemDTO } from '../dtos/OrderQueueDTO.js';

export class GetKitchenQueueUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(now: Date = new Date()): Promise<OrderQueueItemDTO[]> {
    const pendingOrders = await this.orderRepository.findAllPending();
    const prioritizedQueue = PriorityCalculatorService.sortQueue(pendingOrders, now);

    return prioritizedQueue.map(({ order, remainingMinutes, priorityTier }) => ({
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
    }));
  }
}
