import { Order } from '../../src/domain/entities/Order.js';
import { IOrderRepository } from '../../src/domain/ports/IOrderRepository.js';

export class InMemoryOrderRepository implements IOrderRepository {
  public orders: Order[] = [];

  async save(order: Order): Promise<void> {
    this.orders.push(order);
  }

  async findById(id: string): Promise<Order | null> {
    const found = this.orders.find(order => order.id === id);
    return found ? found : null;
  }

  async findAllPending(): Promise<Order[]> {
    return this.orders.filter(
      order => order.status === 'RECEIVED' || order.status === 'IN_PREPARATION'
    );
  }

  async update(order: Order): Promise<void> {
    const index = this.orders.findIndex(item => item.id === order.id);
    if (index !== -1) {
      this.orders[index] = order;
    }
  }
}
