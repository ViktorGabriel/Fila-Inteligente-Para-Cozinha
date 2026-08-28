---
name: prisma-expert
description: Prisma ORM and PostgreSQL schema design, composite indexing, relations, migration workflows, singleton PrismaClient, and Clean Architecture mappers. Use when configuring Prisma, designing schemas, writing queries, or mapping database rows to Domain entities.
---

# Prisma Expert & Database Architecture

## 1. Schema Optimization Guidelines
- Use PostgreSQL ENUMs for finite states (`OrderStatus`, `OrderOrigin`).
- Add composite indices for high-frequency kitchen queue queries:
  ```prisma
  @@index([status, receivedAt])
  ```
- Configure explicit cascade delete on relations where appropriate:
  ```prisma
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  ```

---

## 2. OrderMapper Pattern (Isolation)
Never let Prisma database models leak into the Application or Domain layers. Always map bidirectionally:

```typescript
import { Order as PrismaOrder, OrderItem as PrismaOrderItem } from '@prisma/client';
import { Order } from '../../domain/entities/Order.js';
import { OrderItem } from '../../domain/entities/OrderItem.js';

type PrismaOrderWithItems = PrismaOrder & { items: PrismaOrderItem[] };

export class OrderMapper {
  public static toDomain(raw: PrismaOrderWithItems): Order {
    const items = raw.items.map(
      (item) =>
        new OrderItem({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          prepTimeMinutes: item.prepTimeMinutes,
        })
    );

    return new Order({
      id: raw.id,
      customerName: raw.customerName,
      origin: raw.origin as any,
      status: raw.status as any,
      slaDeliveryMinutes: raw.slaDeliveryMinutes,
      maxPrepTimeMinutes: raw.maxPrepTimeMinutes,
      receivedAt: raw.receivedAt,
      preparationStartedAt: raw.preparationStartedAt,
      readyAt: raw.readyAt,
      items,
    });
  }
}
```
