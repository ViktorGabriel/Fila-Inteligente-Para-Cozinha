import { OrderStatus } from '../../domain/entities/Order.js';
import { IOrderRepository } from '../../domain/ports/IOrderRepository.js';
import { IQueueNotifier } from '../../domain/ports/IQueueNotifier.js';
import { NotFoundError } from '../../core/AppError.js';
import { OrderResponseDTO } from '../dtos/OrderQueueDTO.js';

export interface ChangeOrderStatusDTO {
  orderId: string;
  status: OrderStatus;
}

export class ChangeOrderStatusUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly queueNotifier: IQueueNotifier
  ) {}

  async execute(dto: ChangeOrderStatusDTO): Promise<OrderResponseDTO> {
    const order = await this.orderRepository.findById(dto.orderId);

    if (!order) {
      throw new NotFoundError(`Order with ID '${dto.orderId}' not found`);
    }

    order.changeStatus(dto.status);
    await this.orderRepository.update(order);

    const pendingOrders = await this.orderRepository.findAllPending();
    await this.queueNotifier.notifyQueueUpdated(pendingOrders);

    return {
      id: order.id,
      customerName: order.customerName,
      status: order.status,
      receivedAt: order.receivedAt.toISOString(),
      slaDeliveryMinutes: order.slaDeliveryMinutes,
      maxPrepTimeMinutes: order.maxPrepTimeMinutes,
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        prepTimeMinutes: item.prepTimeMinutes,
      })),
    };
  }
}
