---
name: websocket-patterns
description: Event-driven architecture with Socket.io, connection lifecycle management, real-time kitchen queue broadcasts, event contracts, reconnection snapshot reconciliation, and Express server integration. Use when setting up WebSockets, emitting queue events, or managing real-time KDS state.
---

# WebSocket & Realtime Patterns with Socket.io

## 1. Event Contracts
Define strict type-safe event names across the entire application:

```typescript
export const WS_EVENTS = {
  QUEUE_UPDATED: 'queue:updated',
  ORDER_NEW: 'order:new',
  ORDER_STATUS_CHANGED: 'order:status-changed',
} as const;
```

---

## 2. Decoupled Notifier (Port & Adapter)
The Socket.io implementation must satisfy `IQueueNotifier` and live in `infrastructure/websocket/`:

```typescript
import { Server as SocketIoServer } from 'socket.io';
import { IQueueNotifier } from '../../domain/ports/IQueueNotifier.js';
import { Order } from '../../domain/entities/Order.js';
import { PriorityCalculatorService } from '../../application/services/PriorityCalculatorService.js';

export class SocketIoQueueNotifier implements IQueueNotifier {
  constructor(private readonly io: SocketIoServer) {}

  async notifyQueueUpdated(orders: Order[]): Promise<void> {
    const queueDTO = PriorityCalculatorService.prioritizeQueue(orders);
    this.io.emit('queue:updated', queueDTO);
  }

  async notifyNewOrder(order: Order): Promise<void> {
    this.io.emit('order:new', { id: order.id, customerName: order.customerName });
  }

  async notifyStatusChanged(order: Order): Promise<void> {
    this.io.emit('order:status-changed', { id: order.id, status: order.status });
  }
}
```

---

## 3. Reconnection Reconciliation Pattern
When a client (KDS display) disconnects and reconnects:
1. Client connects via `io.on('connection', (socket) => ...)`.
2. Client immediately fetches current snapshot via REST `GET /api/queue`.
3. Client listens to `queue:updated` for subsequent mutations.
