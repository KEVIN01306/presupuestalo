---
name: create-use-case
description: Creates or updates an Application Use Case in saas-backend following Clean Architecture conventions, repository dependency injection, multi-tenant isolation (negocio_id), and standardized AppError handling.
---

# Skill: Create Use Case (`create-use-case`)

## What It Does
Defines how to create or modify application use cases inside `saas-backend/src/modules/<modulo>/application/<accion>-<entidad>.usecase.ts`. Use cases orchestrate business rules, validate domain invariants, invoke repository contracts or domain services, and translate persistence errors into standardized HTTP/application errors (`AppError`).

## Location & Naming Convention
- **Directory**: `saas-backend/src/modules/<modulo>/application/`
- **File Name**: `<verbo-kebab-case>.usecase.ts`
  - Examples:
    - `registrar-categoria.usecase.ts`
    - `obtener-categoria.usecase.ts`
    - `obtener-categorias.usecase.ts`
    - `actualizar-categoria.usecase.ts`
    - `eliminar-categoria.usecase.ts`
- **Class Name**: `<VerboPascalCase>UseCase` (e.g., `RegistrarCategoriaUseCase`)

## Restrictions & Rules
1. **No Direct Prisma/Express Imports**: A Use Case MUST NEVER import `@prisma/client`, `prisma`, or Express `Request`/`Response`. It only depends on interfaces/types from `../domain/` and `@shared/`.
2. **ESM `.js` Extension**: All relative and path-alias imports in `saas-backend` MUST end with `.js` (e.g., `import AppError from "@shared/errors/AppError.js";`).
3. **Single Public Method**: Expose a single `async execute(...)` method.
4. **Multi-Tenancy (`negocio_id`)**: Every operation that reads or mutates tenant data MUST receive `negocio_id: string` and pass it to the repository.
5. **Standard Error Mapping**:
   - Throw `new AppError(mensaje, codigo, statusCode)` for business rule violations:
     - `400` -> `'INVALID_DATA'` or `'BAD_REQUEST'`
     - `404` -> `'DATA_NOT_FOUND'`
     - `409` -> `'DATA_ALREADY_EXISTS'`
     - `500` -> `'DATABASE_ERROR'`
   - Catch `UniqueConstraintError`, `NotFoundPersistenceError`, and `DatabaseError` from `@shared/database/errors/` and rethrow as `AppError`.
6. **Multi-Step Mutations**: If a use case mutates multiple tables that must succeed or fail atomically, inject `TransactionManager` from `@shared/database/TransactionManager.js`.

## Implementation Examples

### 1. Create / Register Use Case (`registrar-<entidad>.usecase.ts`)
```typescript
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { CategoriaCrear, CategoriaSimple } from "../domain/categoria.entity.js";
import type { CategoriaRepository } from "../domain/categoria.repository.js";

export class RegistrarCategoriaUseCase {
    constructor(private readonly repository: CategoriaRepository) {}

    async execute(data: CategoriaCrear, negocio_id: string): Promise<CategoriaSimple> {
        try {
            if (!data.categoria_padre_id) {
                throw new AppError("La categoria padre es obligatoria", "INVALID_DATA", 400);
            }

            const categoriaExiste = await this.repository.obtenerDefaultPorCategoria(data.categoria);
            if (categoriaExiste) {
                throw new AppError("La Categoria ya existe por default", "DATA_ALREADY_EXISTS", 409);
            }

            const categoriaPadre = await this.repository.obtener(data.categoria_padre_id, negocio_id);
            if (!categoriaPadre) {
                throw new AppError("La categoria padre no existe", "DATA_NOT_FOUND", 404);
            }

            return await this.repository.registrar(data, negocio_id);
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError("La Categoria ya existe", "DATA_ALREADY_EXISTS", 409);
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error en la base de datos", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
```

### 2. Get Single Entity Use Case (`obtener-<entidad>.usecase.ts`)
```typescript
import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { CategoriaSimple } from "../domain/categoria.entity.js";
import type { CategoriaRepository } from "../domain/categoria.repository.js";

export class ObtenerCategoriaUseCase {
    constructor(private readonly repository: CategoriaRepository) {}

    async execute(id: string, negocio_id: string): Promise<CategoriaSimple> {
        try {
            const entidad = await this.repository.obtener(id, negocio_id);
            if (!entidad) {
                throw new AppError("Registro no encontrado", "DATA_NOT_FOUND", 404);
            }
            return entidad;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error en la base de datos", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
```

### 3. Paginated List Use Case (`obtener-<entidades>.usecase.ts`)
```typescript
import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";
import type { CategoriaSimple } from "../domain/categoria.entity.js";
import type { CategoriaRepository } from "../domain/categoria.repository.js";

export class ObtenerCategoriasUseCase {
    constructor(private readonly repository: CategoriaRepository) {}

    async execute(
        negocio_id: string,
        pagination: Pagination,
        q?: string | null
    ): Promise<Paginated<CategoriaSimple>> {
        try {
            return await this.repository.listar(negocio_id, pagination, q);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al obtener los registros", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
```

### 4. Delete (Soft Delete) Use Case (`eliminar-<entidad>.usecase.ts`)
```typescript
import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";
import type { CategoriaRepository } from "../domain/categoria.repository.js";

export class EliminarCategoriaUseCase {
    constructor(private readonly repository: CategoriaRepository) {}

    async execute(id: string, negocio_id: string): Promise<void> {
        try {
            await this.repository.eliminar(id, negocio_id);
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("El registro no existe", "DATA_NOT_FOUND", 404);
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error en la base de datos", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
```
