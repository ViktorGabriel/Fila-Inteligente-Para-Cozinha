---
name: typescript-pro
description: Advanced TypeScript 5+ and Node.js 24 ESM guidelines, strict type safety, tsconfig setup, DTO patterns, and zero-any rules. Use when writing TypeScript code, defining interfaces, typing async handlers, or fixing compilation errors.
---

# TypeScript Pro & Node.js 24 ESM Guidelines

## 1. Module System Rules (NodeNext / ESM)
- In Node.js 24 with `"type": "module"`, all relative imports MUST include the `.js` extension, even when writing `.ts` files.
  ```typescript
  // CORRECT:
  import { Order } from '../entities/Order.js';
  import { AppError } from '../../core/errors/AppError.js';

  // INCORRECT:
  import { Order } from '../entities/Order';
  ```
- Use `node:` prefix for built-in modules (`import crypto from 'node:crypto';`).

---

## 2. Type Safety Invariants
- `noImplicitAny`: Never use `any`. Use `unknown`, generic parameters, or explicit type guards.
- `strictNullChecks`: Explicitly handle `null` and `undefined`.
- Use `readonly` for immutable properties in DTOs and Value Objects.
- Distinguish between Input DTOs, Output DTOs, and Domain Entity Props.

---

## 3. Recommended tsconfig.json Pattern
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"]
}
```
