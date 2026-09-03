import { Order } from '../entities/Order.js';

export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findAllPending(): Promise<Order[]>;
  update(order: Order): Promise<void>;
}
