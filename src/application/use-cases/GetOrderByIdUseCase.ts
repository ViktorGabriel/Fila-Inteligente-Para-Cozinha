import { IOrderRepository } from '../../domain/ports/IOrderRepository.js';
import { NotFoundError } from '../../core/AppError.js';
import { OrderResponseDTO } from '../dtos/OrderQueueDTO.js';

export class GetOrderByIdUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(orderId: string): Promise<OrderResponseDTO> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundError(`Order with ID '${orderId}' not found`);
    }

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
