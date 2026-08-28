---
name: clean-architecture-pro
description: Expert guide and rules for Clean Architecture, SOLID principles, and Domain-Driven Design (DDD) in Node.js and TypeScript. Use when designing modules, entities, use cases, ports, adapters, and enforcing strict boundary isolation.
---

# Clean Architecture & SOLID Master Guide

## 1. Core Principles
- **Dependency Rule**: Source code dependencies must point only inward toward higher-level policies (Core & Domain). Inner layers know nothing of outer layers (DB, Frameworks, WebSockets).
- **Single Responsibility (SRP)**: Each class/module must have one reason to change.
- **Open/Closed (OCP)**: Extend behavior through polymorphism and interfaces, not by editing core logic.
- **Liskov Substitution (LSP)**: Derived classes or implementations must be swappable without breaking contracts.
- **Interface Segregation (ISP)**: Create small, focused interfaces rather than bloated ones.
- **Dependency Inversion (DIP)**: Depend upon abstractions (Ports), not concretions (Adapters).

---

## 2. Directory Layout & Boundaries

```text
src/
├── core/                  # Shared primitives, AppError, Result, Base Entity/VO
├── domain/                # Enterprise Business Rules (Entities, Value Objects, Domain Services)
│   ├── entities/
│   ├── value-objects/
│   └── ports/             # Abstract interfaces (IRepositories, INotifiers)
├── application/           # Application Business Rules (Use Cases, DTOs)
│   ├── dtos/
│   ├── use-cases/
│   └── services/
├── infrastructure/        # Frameworks & Drivers (DB, WebSocket, HTTP Server)
│   ├── database/
│   ├── repositories/
│   └── websocket/
└── presentation/          # Controllers, Middlewares, Routes, Input Validation (Zod)
```

---

## 3. Strict Layering Invariants
1. **Domain Layer**:
   - MUST NOT import from `express`, `socket.io`, `@prisma/client`, or `infrastructure`.
   - Entities encapsulate invariants and state transitions (finite state machines).
   - Value Objects are immutable.
2. **Application Layer**:
   - Orchestrates data flow to and from domain entities.
   - Depends only on Domain Entities and Ports (`IOrderRepository`, `IQueueNotifier`).
   - Returns DTOs to presentation layers, never raw database records.
3. **Infrastructure & Presentation**:
   - Implements ports via concrete classes (e.g. `PrismaOrderRepository` implements `IOrderRepository`).
   - Mappers translate between Database/Transport representations and Domain Entities.
