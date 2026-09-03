import { Order } from '../entities/Order.js';

export interface IQueueNotifier {
  notifyQueueUpdated(orders: Order[]): Promise<void>;
}
