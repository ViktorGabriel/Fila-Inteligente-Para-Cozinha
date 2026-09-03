import { IOrderRepository } from '../../domain/ports/IOrderRepository.js';
import { Order } from '../../domain/entities/Order.js';
import { prisma } from '../database/prisma.js';
import { OrderMapper } from './OrderMapper.js';

export class PrismaOrderRepository implements IOrderRepository {
  async save(order: Order): Promise<void> {
    const data = OrderMapper.toPersistence(order);
    await prisma.order.create({
      data,
    });
  }

  async findById(id: string): Promise<Order | null> {
    const raw = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!raw) {
      return null;
    }

    return OrderMapper.toDomain(raw);
  }

  async findAllPending(): Promise<Order[]> {
    const rawOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ['RECEIVED', 'IN_PREPARATION'],
        },
      },
      include: { items: true },
      orderBy: { receivedAt: 'asc' },
    });

    return rawOrders.map(OrderMapper.toDomain);
  }

  async update(order: Order): Promise<void> {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: order.status,
      },
    });
  }
}
