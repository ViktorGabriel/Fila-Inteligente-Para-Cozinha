import { Order } from '../../src/domain/entities/Order.js';
import { IQueueNotifier } from '../../src/domain/ports/IQueueNotifier.js';

export class FakeQueueNotifier implements IQueueNotifier {
  public notifiedQueues: Order[][] = [];

  async notifyQueueUpdated(orders: Order[]): Promise<void> {
    this.notifiedQueues.push([...orders]);
  }

  get lastNotified(): Order[] | undefined {
    return this.notifiedQueues[this.notifiedQueues.length - 1];
  }
}
