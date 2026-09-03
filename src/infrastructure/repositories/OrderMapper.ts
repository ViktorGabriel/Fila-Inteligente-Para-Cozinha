import { Order, OrderStatus } from '../../domain/entities/Order.js';
import { OrderItem } from '../../domain/entities/OrderItem.js';
import type { Order as PrismaOrder, OrderItem as PrismaOrderItem } from '@prisma/client';

export type PrismaOrderWithItems = PrismaOrder & {
  items: PrismaOrderItem[];
};

export class OrderMapper {
  public static toDomain(raw: PrismaOrderWithItems): Order {
    const items = raw.items.map(
      item =>
        new OrderItem({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          prepTimeMinutes: item.prepTimeMinutes,
        })
    );

    return new Order({
      id: raw.id,
      customerName: raw.customerName,
      status: raw.status as OrderStatus,
      receivedAt: raw.receivedAt,
      slaDeliveryMinutes: raw.slaDeliveryMinutes,
      items,
    });
  }

  public static toPersistence(order: Order) {
    return {
      id: order.id,
      customerName: order.customerName,
      status: order.status,
      receivedAt: order.receivedAt,
      slaDeliveryMinutes: order.slaDeliveryMinutes,
      items: {
        create: order.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          prepTimeMinutes: item.prepTimeMinutes,
        })),
      },
    };
  }
}
