---
name: tdd-workflows
description: Test-Driven Development (TDD) cycle, Vitest test suites, in-memory repository fakes, mock gateways, and unit/integration testing patterns for Node.js backends. Use when writing tests, implementing new features with TDD, or setting up test fixtures.
---

# TDD Workflows & Testing Patterns with Vitest

## 1. The Red-Green-Refactor Cycle
1. **RED**: Write a unit test asserting the expected behavior. Run `vitest run` and confirm it fails for the right reason.
2. **GREEN**: Write the minimal amount of code to make the test pass.
3. **REFACTOR**: Clean up code, remove duplication, and ensure adherence to Clean Architecture without breaking tests.

---

## 2. In-Memory Repository Pattern
Always create test doubles (In-Memory Repositories) inside `test/repositories/` so unit tests execute in milliseconds without database I/O:

```typescript
import { IOrderRepository } from '../../src/domain/ports/IOrderRepository.js';
import { Order } from '../../src/domain/entities/Order.js';

export class InMemoryOrderRepository implements IOrderRepository {
  public items: Order[] = [];

  async save(order: Order): Promise<void> {
    this.items.push(order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findActiveOrders(): Promise<Order[]> {
    return this.items.filter((item) => item.isActive());
  }

  async update(order: Order): Promise<void> {
    const index = this.items.findIndex((item) => item.id === order.id);
    if (index !== -1) {
      this.items[index] = order;
    }
  }
}
```

---

## 3. Fake Notifier Pattern
```typescript
import { IQueueNotifier } from '../../src/domain/ports/IQueueNotifier.js';
import { Order } from '../../src/domain/entities/Order.js';

export class FakeQueueNotifier implements IQueueNotifier {
  public updatedQueues: Order[][] = [];
  public newOrders: Order[] = [];
  public statusChangedOrders: Order[] = [];

  async notifyQueueUpdated(orders: Order[]): Promise<void> {
    this.updatedQueues.push(orders);
  }

  async notifyNewOrder(order: Order): Promise<void> {
    this.newOrders.push(order);
  }

  async notifyStatusChanged(order: Order): Promise<void> {
    this.statusChangedOrders.push(order);
  }
}
```
