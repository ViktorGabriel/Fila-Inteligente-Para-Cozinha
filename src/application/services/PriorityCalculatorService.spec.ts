import { describe, it, expect } from 'vitest';
import { PriorityCalculatorService } from './PriorityCalculatorService.js';
import { PriorityTier } from '../../domain/entities/PriorityTier.js';
import { Order } from '../../domain/entities/Order.js';
import { OrderItem } from '../../domain/entities/OrderItem.js';

describe('PriorityCalculatorService', () => {
  const baseTime = new Date('2026-09-02T12:00:00.000Z');

  function makeOrder(prepMinutes: number, slaMinutes: number, receivedAt: Date = baseTime): Order {
    return new Order({
      customerName: 'Cliente Teste',
      items: [
        new OrderItem({
          name: 'Prato Especial',
          quantity: 1,
          prepTimeMinutes: prepMinutes,
        }),
      ],
      slaDeliveryMinutes: slaMinutes,
      receivedAt,
    });
  }

  describe('calculateRemainingMinutes', () => {
    it('should accurately calculate remaining delivery minutes based on elapsed time', () => {
      const order = makeOrder(15, 45, baseTime);
      // 15 minutos depois do recebimento
      const now = new Date('2026-09-02T12:15:00.000Z');

      const remaining = PriorityCalculatorService.calculateRemainingMinutes(order, now);
      expect(remaining).toBe(30);
    });
  });

  describe('calculateTier', () => {
    it('should classify as CRITICAL when remaining time is less than or equal to maxPrepTimeMinutes', () => {
      // Prep: 20 min, SLA: 30 min. Passaram 15 min -> restam 15 min (15 <= 20) -> CRITICAL
      const order = makeOrder(20, 30, baseTime);
      const now = new Date('2026-09-02T12:15:00.000Z');

      const tier = PriorityCalculatorService.calculateTier(order, now);
      expect(tier).toBe(PriorityTier.CRITICAL);
    });

    it('should classify as HIGH when remaining time is within maxPrep + 10 min', () => {
      // Prep: 15 min, SLA: 40 min. Passaram 15 min -> restam 25 min (15 + 10 = 25) -> HIGH
      const order = makeOrder(15, 40, baseTime);
      const now = new Date('2026-09-02T12:15:00.000Z');

      const tier = PriorityCalculatorService.calculateTier(order, now);
      expect(tier).toBe(PriorityTier.HIGH);
    });

    it('should classify as MEDIUM when remaining time is within maxPrep + 25 min', () => {
      // Prep: 10 min, SLA: 40 min. Passaram 5 min -> restam 35 min (10 + 25 = 35) -> MEDIUM
      const order = makeOrder(10, 40, baseTime);
      const now = new Date('2026-09-02T12:05:00.000Z');

      const tier = PriorityCalculatorService.calculateTier(order, now);
      expect(tier).toBe(PriorityTier.MEDIUM);
    });

    it('should classify as LOW when remaining time has plenty of buffer (> maxPrep + 25 min)', () => {
      // Prep: 10 min, SLA: 60 min. Passaram 5 min -> restam 55 min (55 > 35) -> LOW
      const order = makeOrder(10, 60, baseTime);
      const now = new Date('2026-09-02T12:05:00.000Z');

      const tier = PriorityCalculatorService.calculateTier(order, now);
      expect(tier).toBe(PriorityTier.LOW);
    });
  });

  describe('sortQueue', () => {
    it('should sort orders placing CRITICAL first, then HIGH, MEDIUM, and LOW', () => {
      const now = new Date('2026-09-02T12:20:00.000Z');

      // Pedido A: prep 20, sla 30 -> restam 10 -> CRITICAL
      const criticalOrder = makeOrder(20, 30, baseTime);

      // Pedido B: prep 15, sla 40 -> restam 20 (15+10=25) -> HIGH
      const highOrder = makeOrder(15, 40, baseTime);

      // Pedido C: prep 10, sla 50 -> restam 30 (10+25=35) -> MEDIUM
      const mediumOrder = makeOrder(10, 50, baseTime);

      // Pedido D: prep 5, sla 60 -> restam 40 (40 > 30) -> LOW
      const lowOrder = makeOrder(5, 60, baseTime);

      // Envia os pedidos fora de ordem
      const queue = [lowOrder, highOrder, criticalOrder, mediumOrder];
      const sorted = PriorityCalculatorService.sortQueue(queue, now);

      expect(sorted[0].priorityTier).toBe(PriorityTier.CRITICAL);
      expect(sorted[1].priorityTier).toBe(PriorityTier.HIGH);
      expect(sorted[2].priorityTier).toBe(PriorityTier.MEDIUM);
      expect(sorted[3].priorityTier).toBe(PriorityTier.LOW);
    });

    it('should break ties within the same tier by remainingMinutes ascending', () => {
      const now = new Date('2026-09-02T12:20:00.000Z');

      // Ambos CRITICAL, mas order1 tem menos tempo restante que order2
      const orderUrgent = makeOrder(20, 25, baseTime); // restam 5 min -> CRITICAL
      const orderLessUrgent = makeOrder(20, 30, baseTime); // restam 10 min -> CRITICAL

      const sorted = PriorityCalculatorService.sortQueue([orderLessUrgent, orderUrgent], now);

      expect(sorted[0].remainingMinutes).toBe(5);
      expect(sorted[1].remainingMinutes).toBe(10);
    });
  });
});
