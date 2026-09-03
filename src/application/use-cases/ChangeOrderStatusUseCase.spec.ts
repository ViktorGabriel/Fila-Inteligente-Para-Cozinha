import { describe, it, expect, beforeEach } from 'vitest';
import { ChangeOrderStatusUseCase } from './ChangeOrderStatusUseCase.js';
import { InMemoryOrderRepository } from '../../../test/repositories/InMemoryOrderRepository.js';
import { FakeQueueNotifier } from '../../../test/gateways/FakeQueueNotifier.js';
import { Order } from '../../domain/entities/Order.js';
import { OrderItem } from '../../domain/entities/OrderItem.js';
import { NotFoundError, InvalidStateTransitionError } from '../../core/AppError.js';

describe('ChangeOrderStatusUseCase', () => {
  let orderRepository: InMemoryOrderRepository;
  let queueNotifier: FakeQueueNotifier;
  let sut: ChangeOrderStatusUseCase;

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    queueNotifier = new FakeQueueNotifier();
    sut = new ChangeOrderStatusUseCase(orderRepository, queueNotifier);
  });

  it('should transition order status, update repository and notify queue', async () => {
    const order = new Order({
      customerName: 'Viktor',
      slaDeliveryMinutes: 30,
      items: [new OrderItem({ name: 'Pizza', quantity: 1, prepTimeMinutes: 15 })],
    });
    await orderRepository.save(order);

    const updated = await sut.execute({
      orderId: order.id,
      status: 'IN_PREPARATION',
    });

    expect(updated.status).toBe('IN_PREPARATION');
    expect(orderRepository.orders[0].status).toBe('IN_PREPARATION');
    expect(queueNotifier.notifiedQueues).toHaveLength(1);
  });

  it('should throw NotFoundError if order does not exist', async () => {
    await expect(
      sut.execute({
        orderId: 'non-existent-id',
        status: 'IN_PREPARATION',
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('should throw InvalidStateTransitionError on forbidden transition', async () => {
    const order = new Order({
      customerName: 'Viktor',
      slaDeliveryMinutes: 30,
      items: [new OrderItem({ name: 'Pizza', quantity: 1, prepTimeMinutes: 15 })],
    });
    await orderRepository.save(order);

    // Tentando pular de RECEIVED direto para READY
    await expect(
      sut.execute({
        orderId: order.id,
        status: 'READY',
      })
    ).rejects.toThrow(InvalidStateTransitionError);
  });
});
