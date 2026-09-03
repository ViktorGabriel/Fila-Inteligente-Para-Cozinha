# 🍳 Plano de Implementação Passo a Passo — Fila Inteligente para Cozinha (KDS)

Este plano foi estruturado sob os princípios de **Clean Architecture** e **SOLID** com foco pedagógico. Cada etapa é incremental, isolada e acompanhada de testes unitários/integrados e pontos de commit git.

---

## 🏗️ Visão Geral da Arquitetura

O sistema adota a **Clean Architecture (Onion Architecture)**, onde o fluxo de dependência aponta estritamente **de fora para dentro**:

```
┌─────────────────────────────────────────────────────────┐
│  Presentation Layer (Express HTTP Routes, Controllers)  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Infrastructure (Prisma DB, Socket.io Gateway)    │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Application Layer (Use Cases, DTOs)        │  │  │
│  │  │  ┌───────────────────────────────────────┐  │  │  │
│  │  │  │  Domain Layer (Entities, Ports, Math) │  │  │  │
│  │  │  │  ┌─────────────────────────────────┐  │  │  │  │
│  │  │  │  │ Core (AppError, Global Types)   │  │  │  │  │
│  │  │  │  └─────────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

- **Domain**: Regras de negócio puras (sem dependência de banco de dados, HTTP ou Socket.io).
- **Application**: Casos de uso que orquestram a lógica do negócio via contratos de interfaces (**Ports**).
- **Infrastructure**: Implementações concretas de banco de dados (Prisma) e tempo real (Socket.io).
- **Presentation**: Roteamento Express, validação com Zod e controladores HTTP.

---

## 🗺️ Mapa de Etapas

- [x] **Etapa 0**: Configuração do Ambiente e Ferramental
- [x] **Etapa 1**: Camada Core e Entidades de Domínio Puro
- [x] **Etapa 2**: Serviço de Priorização Inteligente por Faixas de SLA
- [x] **Etapa 3**: Camada de Aplicação (Use Cases & In-Memory Tests)
- [x] **Etapa 4**: Camada de Infraestrutura (Prisma ORM & PostgreSQL)
- [x] **Etapa 5**: Camada de Apresentação (Express REST API & Schemas Zod)
- [x] **Etapa 6**: Tempo Real com WebSocket (Socket.io) & KDS Visualizer
- [x] **Etapa 7**: Validação End-to-End e Documentação Final

---

## 📌 Etapa 0: Configuração do Ambiente e Ferramental

### Objetivo
Configurar o ambiente com Node.js 24 ESM, TypeScript, Vitest e Docker Compose para PostgreSQL.

### Arquivos
- `package.json`
- `tsconfig.json`
- `vitest.config.ts`
- `.env` e `.env.example`
- `docker-compose.yml`

### Validação
```bash
npm install
npm test
```

### 🏷️ Commit
```bash
git add .
git commit -m "chore: initial project setup with node 24, typescript and vitest"
```

---

## 📌 Etapa 1: Camada Core e Entidades de Domínio Puro

### Objetivo
Construir o coração da aplicação sem dependências externas. As entidades garantem as invariantes de negócio e a máquina de estados do pedido.

### Arquivos
1. `src/core/errors/AppError.ts`: Hierarquia de erros (`NotFoundError`, `ValidationError`, `InvalidStateTransitionError`).
2. `src/domain/entities/OrderItem.ts`: Entidade de item (nome, quantidade, tempo de preparo).
3. `src/domain/entities/Order.ts`: Agregação raiz com ciclo de vida (`RECEIVED` $\rightarrow$ `IN_PREPARATION` $\rightarrow$ `READY`) e cálculo de `maxPrepTimeMinutes`.
4. `src/domain/ports/IOrderRepository.ts`: Interface de repositório (DIP - Inversão de Dependência).
5. `src/domain/ports/IQueueNotifier.ts`: Interface de notificações em tempo real.
6. `src/domain/entities/Order.spec.ts`: Testes unitários do domínio.

### Conceitos SOLID Aplicados
- **Single Responsibility Principle (SRP)**: Cada entidade responde apenas por sua validação e estado.
- **Dependency Inversion Principle (DIP)**: Definição de `ports` (interfaces) que a infraestrutura implementará.

### Validação
```bash
npx vitest run src/domain/entities/Order.spec.ts
```

### 🏷️ Commit
```bash
git add src/core src/domain
git commit -m "feat(domain): implement core errors, order entity, ports and unit tests"
```

---

## 📌 Etapa 2: Serviço de Priorização Inteligente por Faixas de SLA

### Objetivo
Implementar o algoritmo que calcula a urgência de atendimento e classifica cada pedido em faixas de prioridade (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).

### Regra Matemática
$$\text{Tempo Restante (min)} = \text{slaDeliveryMinutes} - \left(\frac{\text{Data Atual} - \text{receivedAt}}{60000}\right)$$

- 🔴 **CRITICAL**: $\text{Tempo Restante} \le \text{maxPrepTimeMinutes}$
- 🟠 **HIGH**: $\text{Tempo Restante} \le \text{maxPrepTimeMinutes} + 10\text{ min}$
- 🟡 **MEDIUM**: $\text{Tempo Restante} \le \text{maxPrepTimeMinutes} + 25\text{ min}$
- 🟢 **LOW**: $\text{Tempo Restante} > \text{maxPrepTimeMinutes} + 25\text{ min}$

### Arquivos
1. `src/domain/entities/PriorityTier.ts`: Enum das faixas de prioridade.
2. `src/application/services/PriorityCalculatorService.ts`: Serviço de cálculo e ordenação da fila.
3. `src/application/services/PriorityCalculatorService.spec.ts`: Testes unitários de todos os cenários de urgência.

### Validação
```bash
npx vitest run src/application/services/PriorityCalculatorService.spec.ts
```

### 🏷️ Commit
```bash
git add src/application/services src/domain/entities/PriorityTier.ts
git commit -m "feat(domain): implement dynamic priority calculator service and SLA tiers"
```

---

## 📌 Etapa 3: Camada de Aplicação (Use Cases & In-Memory Tests)

### Objetivo
Implementar os Casos de Uso que orquestram a criação, consulta e transição de status dos pedidos, emitindo notificações reativas.

### Arquivos
1. `src/application/dtos/CreateOrderDTO.ts` e `OrderQueueDTO.ts`
2. `src/application/use-cases/CreateOrderUseCase.ts`: Cria pedido e notifica WebSocket.
3. `src/application/use-cases/ChangeOrderStatusUseCase.ts`: Avança status e notifica WebSocket.
4. `src/application/use-cases/GetKitchenQueueUseCase.ts`: Retorna fila ordenada por prioridade.
5. `src/application/use-cases/GetOrderByIdUseCase.ts`: Busca pedido por ID.
6. `test/repositories/InMemoryOrderRepository.ts`: Mock de banco de dados para testes ultrarrápidos sem I/O.
7. `test/gateways/FakeQueueNotifier.ts`: Mock do emissor WebSocket.
8. `src/application/use-cases/*.spec.ts`: Suíte de testes unitários para todos os casos de uso.

### Validação
```bash
npx vitest run src/application/use-cases
```

### 🏷️ Commit
```bash
git add src/application/use-cases src/application/dtos test/
git commit -m "feat(application): implement order use cases and in-memory test suite"
```

---

## 📌 Etapa 4: Camada de Infraestrutura (Prisma ORM & PostgreSQL)

### Objetivo
Configurar a persistência relacional com PostgreSQL, gerando migrações e implementando o repositório concreto via Prisma.

### Arquivos
1. `prisma/schema.prisma`: Modelos `Order` e `OrderItem` com índices para busca otimizada.
2. `src/infrastructure/database/prisma.ts`: Conexão singleton do PrismaClient.
3. `src/infrastructure/repositories/PrismaOrderRepository.ts`: Implementação concreta de `IOrderRepository`.
4. `src/infrastructure/repositories/OrderMapper.ts`: Conversor bidirecional (Prisma Model $\leftrightarrow$ Domain Entity).

### Validação
```bash
npx prisma generate
```

### 🏷️ Commit
```bash
git add prisma/ src/infrastructure/database src/infrastructure/repositories
git commit -m "feat(infra): setup prisma schema, database client and prisma order repository"
```

---

## 📌 Etapa 5: Camada de Apresentação (Express REST API & Zod Schemas)

### Objetivo
Criar as rotas HTTP, validação de payload em tempo de execução com Zod e controladores REST.

### Endpoints REST
- `POST /api/orders`: Ingestão de pedidos (retorna `201 Created`).
- `GET /api/queue`: Obtenção da fila priorizada (retorna `200 OK`).
- `PATCH /api/orders/:id/status`: Transição de status (retorna `200 OK`).
- `GET /api/orders/:id`: Detalhes do pedido (retorna `200 OK`).

### Arquivos
1. `src/presentation/schemas/orderSchemas.ts`: Schemas Zod para criação e mudança de status.
2. `src/presentation/middlewares/errorHandler.ts`: Middleware centralizador de erros.
3. `src/presentation/controllers/OrderController.ts`: Controlador de pedidos.
4. `src/presentation/controllers/QueueController.ts`: Controlador da fila da cozinha.
5. `src/presentation/routes/orderRoutes.ts` e `queueRoutes.ts`.

### Validação
```bash
npm run build
```

### 🏷️ Commit
```bash
git add src/presentation
git commit -m "feat(presentation): implement express controllers, zod validation and REST routes"
```

---

## 📌 Etapa 6: Tempo Real com WebSocket (Socket.io) & KDS Visualizer

### Objetivo
Integrar o servidor Express com o Socket.io, implementando a notificação instantânea da fila e disponibilizando uma interface web minimalista para demonstração ao vivo.

### Arquivos
1. `src/infrastructure/websocket/SocketIoQueueNotifier.ts`: Implementação de `IQueueNotifier`.
2. `src/infrastructure/server/app.ts`: Configuração do Express.
3. `src/infrastructure/server/server.ts`: Inicialização do HTTP Server + Socket.io Server na porta 3333.
4. `public/index.html`: Dashboard KDS em tempo real para visualização e testes interativos no navegador.

### Validação
```bash
npm run dev
# Acessar http://localhost:3333 no navegador para testar a reatividade
```

### 🏷️ Commit
```bash
git add src/infrastructure/websocket src/infrastructure/server public/
git commit -m "feat(realtime): integrate socket.io notifier and KDS dashboard visualizer"
```

---

## 📌 Etapa 7: Validação End-to-End, Cobertura de Testes e Documentação

### Objetivo
Executar todos os testes com 100% de aprovação, verificar integridade dos tipos TypeScript e gerar documentação completa de apresentação técnica.

### Arquivos
- `README.md`: Apresentação do projeto, arquitetura, design decisions e guia de execução rápida.

### Validação Final
```bash
npm test
npm run build
```

### 🏷️ Commit
```bash
git add README.md
git commit -m "docs: add comprehensive architectural documentation and project guide"
```
