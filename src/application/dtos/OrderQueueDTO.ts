import { OrderStatus } from '../../domain/entities/Order.js';
import { PriorityTier } from '../../domain/entities/PriorityTier.js';

export interface OrderItemResponseDTO {
  id: string;
  name: string;
  quantity: number;
  prepTimeMinutes: number;
}

export interface OrderQueueItemDTO {
  id: string;
  customerName: string;
  status: OrderStatus;
  receivedAt: string;
  slaDeliveryMinutes: number;
  maxPrepTimeMinutes: number;
  remainingMinutes: number;
  priorityTier: PriorityTier;
  items: OrderItemResponseDTO[];
}

export interface OrderResponseDTO {
  id: string;
  customerName: string;
  status: OrderStatus;
  receivedAt: string;
  slaDeliveryMinutes: number;
  maxPrepTimeMinutes: number;
  items: OrderItemResponseDTO[];
}
