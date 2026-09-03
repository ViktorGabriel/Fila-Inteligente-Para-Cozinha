import { Order } from '../../domain/entities/Order.js';
import { PriorityTier } from '../../domain/entities/PriorityTier.js';

export interface PrioritizedOrder {
  order: Order;
  remainingMinutes: number;
  priorityTier: PriorityTier;
}

const TIER_WEIGHT: Record<PriorityTier, number> = {
  [PriorityTier.CRITICAL]: 1,
  [PriorityTier.HIGH]: 2,
  [PriorityTier.MEDIUM]: 3,
  [PriorityTier.LOW]: 4,
};

export class PriorityCalculatorService {
  public static calculateRemainingMinutes(order: Order, now: Date = new Date()): number {
    const elapsedMinutes = (now.getTime() - order.receivedAt.getTime()) / 60000;
    const remaining = order.slaDeliveryMinutes - elapsedMinutes;
    return Math.round(remaining * 100) / 100;
  }

  public static calculateTier(order: Order, now: Date = new Date()): PriorityTier {
    const remainingMinutes = this.calculateRemainingMinutes(order, now);
    const maxPrep = order.maxPrepTimeMinutes;

    if (remainingMinutes <= maxPrep) {
      return PriorityTier.CRITICAL;
    }

    if (remainingMinutes <= maxPrep + 10) {
      return PriorityTier.HIGH;
    }

    if (remainingMinutes <= maxPrep + 25) {
      return PriorityTier.MEDIUM;
    }

    return PriorityTier.LOW;
  }

  public static prioritizeOrder(order: Order, now: Date = new Date()): PrioritizedOrder {
    return {
      order,
      remainingMinutes: this.calculateRemainingMinutes(order, now),
      priorityTier: this.calculateTier(order, now),
    };
  }

  public static sortQueue(orders: Order[], now: Date = new Date()): PrioritizedOrder[] {
    const prioritized = orders.map(order => this.prioritizeOrder(order, now));

    return prioritized.sort((a, b) => {
      const weightDiff = TIER_WEIGHT[a.priorityTier] - TIER_WEIGHT[b.priorityTier];
      if (weightDiff !== 0) {
        return weightDiff;
      }
      return a.remainingMinutes - b.remainingMinutes;
    });
  }
}
