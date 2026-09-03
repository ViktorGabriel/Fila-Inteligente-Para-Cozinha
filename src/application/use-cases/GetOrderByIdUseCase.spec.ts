import { describe, it, expect, beforeEach } from 'vitest';
import { GetOrderByIdUseCase } from './GetOrderByIdUseCase.js';
import { InMemoryOrderRepository } from '../../../test/repositories/InMemoryOrderRepository.js';
import { Order } from '../../domain/entities/Order.js';
import { OrderItem } from '../../domain/entities/OrderItem.js';
import { NotFoundError } from '../../core/AppError.js';

describe('GetOrderByIdUseCase', () => {
  let orderRepository: InMemoryOrderRepository;
  let sut: GetOrderByIdUseCase;

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    sut = new GetOrderByIdUseCase(orderRepository);
  });

  it('should find an order by id and return its details', async () => {
    const order = new Order({
      customerName: 'Viktor',
      slaDeliveryMinutes: 30,
      items: [new OrderItem({ name: 'Pizza', quantity: 2, prepTimeMinutes: 15 })],
    });
    await orderRepository.save(order);

    const result = await sut.execute(order.id);

    expect(result.id).toBe(order.id);
    expect(result.customerName).toBe('Viktor');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Pizza');
  });

  it('should throw NotFoundError if order does not exist', async () => {
    await expect(sut.execute('non-existent-id')).rejects.toThrow(NotFoundError);
  });
});
