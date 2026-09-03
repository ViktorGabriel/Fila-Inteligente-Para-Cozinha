import { describe, it, expect, beforeEach } from 'vitest';
import { CreateOrderUseCase } from './CreateOrderUseCase.js';
import { InMemoryOrderRepository } from '../../../test/repositories/InMemoryOrderRepository.js';
import { FakeQueueNotifier } from '../../../test/gateways/FakeQueueNotifier.js';
import { ValidationError } from '../../core/AppError.js';

describe('CreateOrderUseCase', () => {
  let orderRepository: InMemoryOrderRepository;
  let queueNotifier: FakeQueueNotifier;
  let sut: CreateOrderUseCase;

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    queueNotifier = new FakeQueueNotifier();
    sut = new CreateOrderUseCase(orderRepository, queueNotifier);
  });

  it('should create an order, persist it in repository and notify the updated queue', async () => {
    const output = await sut.execute({
      customerName: 'Viktor Gabriel',
      slaDeliveryMinutes: 45,
      items: [
        { name: 'X-Burger', quantity: 1, prepTimeMinutes: 12 },
        { name: 'Fritas', quantity: 1, prepTimeMinutes: 8 },
      ],
    });

    expect(output.id).toBeDefined();
    expect(output.customerName).toBe('Viktor Gabriel');
    expect(output.status).toBe('RECEIVED');
    expect(output.maxPrepTimeMinutes).toBe(12);

    expect(orderRepository.orders).toHaveLength(1);
    expect(queueNotifier.notifiedQueues).toHaveLength(1);
    expect(queueNotifier.lastNotified?.[0].id).toBe(output.id);
  });

  it('should throw ValidationError if input has invalid data', async () => {
    await expect(
      sut.execute({
        customerName: '',
        slaDeliveryMinutes: 45,
        items: [{ name: 'X-Burger', quantity: 1, prepTimeMinutes: 12 }],
      })
    ).rejects.toThrow(ValidationError);

    expect(orderRepository.orders).toHaveLength(0);
    expect(queueNotifier.notifiedQueues).toHaveLength(0);
  });
});
