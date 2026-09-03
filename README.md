# 🍳 Fila Inteligente para Cozinha (KDS — Kitchen Display System)

Sistema inteligente de priorização dinâmica e gerenciamento em tempo real de pedidos de restaurante e delivery, construído com **Node.js (ESM)**, **TypeScript 5+**, **Clean Architecture (Onion Architecture)**, **Domain-Driven Design (DDD)**, **Prisma ORM**, **PostgreSQL** e **WebSockets (Socket.io)**.

---

## 🏗️ Arquitetura do Sistema

O projeto segue estritamente os princípios da **Clean Architecture** e **SOLID**, garantindo que as regras de negócio permaneçam desacopladas de bibliotecas e frameworks externos:

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation Layer (Express HTTP Routes, Controllers, Zod) │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Infrastructure (Prisma DB, Socket.io Gateway, Server)│  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Application Layer (Use Cases, DTOs, Services)   │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │  Domain Layer (Entities, Ports, Math SLA) │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐  │  │  │  │
│  │  │  │  │ Core (AppError, Global Types)       │  │  │  │  │
│  │  │  │  └─────────────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 🛡️ Princípios SOLID Aplicados:
- **Single Responsibility Principle (SRP):** Cada entidade e caso de uso tem apenas uma única responsabilidade de negócio.
- **Open/Closed Principle (OCP):** Novos algoritmos de priorização ou canais de notificação podem ser plugados sem alterar o núcleo de domínio.
- **Liskov Substitution Principle (LSP):** Repositórios em memória (`InMemoryOrderRepository`) substituem o banco real (`PrismaOrderRepository`) de forma transparente em testes.
- **Interface Segregation Principle (ISP):** Portas granulares e focadas (`IOrderRepository`, `IQueueNotifier`).
- **Dependency Inversion Principle (DIP):** O domínio define as interfaces (Ports), e a infraestrutura implementa os adaptadores (Adapters).

---

## ⚡ Algoritmo de Priorização Dinâmica de SLA

Diferente de filas comuns (FIFO - primeiro a entrar, primeiro a sair), a **Fila Inteligente** avalia o risco real de estouro da promessa feita ao cliente:

$$\text{Tempo Restante (min)} = \text{slaDeliveryMinutes} - \left(\frac{\text{Data Atual} - \text{receivedAt}}{60.000}\right)$$

Com base no tempo que o cliente ainda pode esperar e no tempo do item mais demorado do pedido ($\text{maxPrepTimeMinutes}$):

| Faixa | Nome | Condição Matemática | Significado Operacional |
| :---: | :---: | :---: | :--- |
| 🔴 | **CRITICAL** | $\text{Restante} \le \text{maxPrepTimeMinutes}$ | **Risco Iminente de Atraso:** Se a cozinha não iniciar imediatamente, a entrega atrasará. |
| 🟠 | **HIGH** | $\text{Restante} \le \text{maxPrepTimeMinutes} + 10\text{ min}$ | **Atenção Alta:** Menos de 10 minutos de margem de folga. |
| 🟡 | **MEDIUM** | $\text{Restante} \le \text{maxPrepTimeMinutes} + 25\text{ min}$ | **Atenção Média:** Pedido aguardando preparo com margem segura. |
| 🟢 | **LOW** | $\text{Restante} > \text{maxPrepTimeMinutes} + 25\text{ min}$ | **Tranquilo:** Margem ampla para atendimento. |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 22+ ou 24+
- Docker & Docker Compose (para o PostgreSQL)

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/ViktorGabriel/Fila-Inteligente-Para-Cozinha.git
cd Fila-Inteligente-Para-Cozinha
npm install
```

### 2. Subir o Banco de Dados com Docker
```bash
docker compose up -d
```

### 3. Gerar o Cliente Prisma e Aplicar Migrations
```bash
npx prisma generate
npx prisma db push
```

### 4. Iniciar o Servidor em Modo Desenvolvimento
```bash
npm run dev
```
- 🌐 **Dashboard KDS Interativo:** Acesse [http://localhost:3333](http://localhost:3333) no navegador.
- 📡 **API REST:** Base URL em `http://localhost:3333/api`
- ⚡ **WebSocket:** Socket.io escutando na porta `3333`.

---

## 🧪 Testes Automatizados

A aplicação conta com uma suíte de **testes unitários ultrarrápidos com Vitest** e dublês de teste em memória (In-Memory Fakes):

```bash
# Executar todos os testes:
npm test

# Executar em modo interativo (watch):
npm run test:watch
```

---

## 📡 Endpoints REST

### 1. Ingestão de Pedidos
- **`POST /api/orders`**
- **Status:** `201 Created`
- **Exemplo de Payload:**
```json
{
  "customerName": "Maria Oliveira",
  "slaDeliveryMinutes": 40,
  "items": [
    { "name": "Hambúrguer Artesanal", "quantity": 1, "prepTimeMinutes": 18 },
    { "name": "Batata Rústica", "quantity": 1, "prepTimeMinutes": 10 }
  ]
}
```

### 2. Obter Fila da Cozinha em Tempo Real
- **`GET /api/queue`**
- **Status:** `200 OK`
- Retorna todos os pedidos pendentes (`RECEIVED` e `IN_PREPARATION`) ordenados por criticidade e tempo restante.

### 3. Transição de Status do Pedido
- **`PATCH /api/orders/:id/status`**
- **Status:** `200 OK`
- **Valores Permitidos:** `'IN_PREPARATION'` ou `'READY'`.
- **Exemplo de Payload:**
```json
{
  "status": "IN_PREPARATION"
}
```

### 4. Consultar Detalhes do Pedido
- **`GET /api/orders/:id`**
- **Status:** `200 OK`

---

## 💻 Visualizador KDS em Tempo Real

A aplicação inclui uma interface web reativa em [public/index.html](file:///c:/Users/Viktor/Documents/estagio/Fila-Inteligente-Para-Cozinha/public/index.html):
- Atualização instantânea sem recarregar a página através de eventos **Socket.io** (`queue:updated`).
- Cards coloridos por faixa de prioridade com animação de pulso nos pedidos críticos.
- Botões de ação em 1 clique para iniciar preparo e concluir pratos.
- Modal para ingestão de novos pedidos em tempo real.

---

## 👨‍💻 Autor e Licença
Desenvolvido por **Viktor Gabriel**. Licença ISC.
