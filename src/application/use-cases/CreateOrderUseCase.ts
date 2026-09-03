import { Order } from '../../domain/entities/Order.js';
import { OrderItem } from '../../domain/entities/OrderItem.js';
import { IOrderRepository } from '../../domain/ports/IOrderRepository.js';
import { IQueueNotifier } from '../../domain/ports/IQueueNotifier.js';
import { CreateOrderDTO } from '../dtos/CreateOrderDTO.js';
import { OrderResponseDTO } from '../dtos/OrderQueueDTO.js';

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly queueNotifier: IQueueNotifier
  ) {}

  async execute(dto: CreateOrderDTO): Promise<OrderResponseDTO> {
    const items = dto.items.map(
      item =>
        new OrderItem({
          name: item.name,
          quantity: item.quantity,
          prepTimeMinutes: item.prepTimeMinutes,
        })
    );

    const order = new Order({
      customerName: dto.customerName,
      items,
      slaDeliveryMinutes: dto.slaDeliveryMinutes,
    });

    await this.orderRepository.save(order);

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
