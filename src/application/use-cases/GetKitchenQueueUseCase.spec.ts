import { describe, it, expect, beforeEach } from 'vitest';
import { GetKitchenQueueUseCase } from './GetKitchenQueueUseCase.js';
import { InMemoryOrderRepository } from '../../../test/repositories/InMemoryOrderRepository.js';
import { Order } from '../../domain/entities/Order.js';
import { OrderItem } from '../../domain/entities/OrderItem.js';
import { PriorityTier } from '../../domain/entities/PriorityTier.js';

describe('GetKitchenQueueUseCase', () => {
  let orderRepository: InMemoryOrderRepository;
  let sut: GetKitchenQueueUseCase;
  const baseTime = new Date('2026-09-02T12:00:00.000Z');

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    sut = new GetKitchenQueueUseCase(orderRepository);
  });

  it('should return pending kitchen queue prioritized dynamically', async () => {
    // Pedido tranquilo (LOW)
    const orderLow = new Order({
      customerName: 'Cliente Tranquilo',
      slaDeliveryMinutes: 60,
      receivedAt: baseTime,
      items: [new OrderItem({ name: 'Salada', quantity: 1, prepTimeMinutes: 5 })],
    });

    // Pedido crítico (CRITICAL)
    const orderCritical = new Order({
      customerName: 'Cliente Urgente',
      slaDeliveryMinutes: 30,
      receivedAt: baseTime,
      items: [new OrderItem({ name: 'Costela Assada', quantity: 1, prepTimeMinutes: 25 })],
    });

    // Pedido já finalizado (READY) - não deve aparecer na fila
    const orderReady = new Order({
      customerName: 'Cliente Atendido',
      slaDeliveryMinutes: 30,
      receivedAt: baseTime,
      items: [new OrderItem({ name: 'Café', quantity: 1, prepTimeMinutes: 2 })],
    });
    orderReady.startPreparation();
    orderReady.markAsReady();

    await orderRepository.save(orderLow);
    await orderRepository.save(orderCritical);
    await orderRepository.save(orderReady);

    // 10 minutos depois
    const now = new Date('2026-09-02T12:10:00.000Z');
    const queue = await sut.execute(now);

    expect(queue).toHaveLength(2);
    expect(queue[0].customerName).toBe('Cliente Urgente');
    expect(queue[0].priorityTier).toBe(PriorityTier.CRITICAL);
    expect(queue[1].customerName).toBe('Cliente Tranquilo');
    expect(queue[1].priorityTier).toBe(PriorityTier.LOW);
  });
});
