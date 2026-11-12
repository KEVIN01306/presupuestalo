---
name: create-repository
description: Creates or updates Domain Repository interfaces, Prisma Repository implementations, Entity Mappers in saas-backend, and Axios API Repositories in saas-frontend.
---

# Skill: Create Repository (`create-repository`)

## What It Does
Guides the creation of data access layers across both **Backend** (Domain contract + Prisma implementation + Mapper) and **Frontend** (Axios repository). Ensures multi-tenant isolation (`negocio_id`), soft-deletion (`activo: true`), standardized pagination, and proper error mapping.

## Locations & Naming Conventions
- **Backend Domain Interface**: `saas-backend/src/modules/<modulo>/domain/<entidad>.repository.ts`
- **Backend Prisma Implementation**: `saas-backend/src/modules/<modulo>/infrastructure/prisma-<entidad>.repository.ts`
- **Backend Mapper**: `saas-backend/src/modules/<modulo>/infrastructure/mappers/<entidad>.mapper.ts`
- **Frontend API Repository**: `saas-frontend/src/modules/<modulo>/infrastructure/repositories/<entidad>.repository.ts`

## Restrictions & Rules

### Backend Restrictions
1. **Contract First**: Always define or update the interface in `domain/<entidad>.repository.ts` before modifying `infrastructure/prisma-<entidad>.repository.ts`.
2. **Multi-Tenancy & Soft Deletes**:
   - Every query on tenant-scoped tables MUST include `negocio_id` and `activo: true` in the `where` clause (or `OR: [{ negocio_id }, { default_<entidad>: true }]` for shared catalog models).
   - Deletions MUST be soft deletes (`update` or `updateMany` setting `activo: false`) unless the table explicitly lacks an `activo` column.
   - When using `updateMany` for soft delete, check `if (result.count === 0) throw new NotFoundPersistenceError();`.
3. **Error Mapping**: Wrap every Prisma call in `try / catch` and throw `PrismaErrorMapper.map(error)` (re-throwing `NotFoundPersistenceError` first if thrown manually).
4. **Domain Mappers**: Never leak raw Prisma model types (`@prisma/client`) outside `infrastructure/`. Always map Prisma records using `<Entidad>Mapper.mapSimple(...)` or `<Entidad>Mapper.mapDetalle(...)`.
5. **ESM `.js` Imports**: All local and alias imports in `saas-backend` must end in `.js`.

### Frontend Restrictions
1. Use the centralized `api` client from `../../../../core/api/api`.
2. Export a const object `<Entidad>Repository` with typed methods (`listar`, `Obtener`/`obtener`, `registrar`, `actualizar`, `eliminar`).
3. Support `AbortSignal` on list/search requests when applicable.

---

## Implementation Examples

### 1. Backend Domain Contract (`domain/<entidad>.repository.ts`)
```typescript
import type { CategoriaActualizar, CategoriaCrear, CategoriaSimple } from "./categoria.entity.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";

export interface CategoriaRepository {
    registrar(data: CategoriaCrear, negocio_id: string): Promise<CategoriaSimple>;
    actualizar(id: string, data: CategoriaActualizar, negocio_id: string): Promise<CategoriaSimple>;
    eliminar(id: string, negocio_id: string): Promise<void>;
    obtener(id: string, negocio_id: string): Promise<CategoriaSimple | null>;
    listar(negocio_id: string, pagination: Pagination, q?: string | null): Promise<Paginated<CategoriaSimple>>;
}
```

### 2. Backend Mapper (`infrastructure/mappers/<entidad>.mapper.ts`)
```typescript
import type { CategoriaProducto } from "@prisma/client";
import type { CategoriaSimple } from "../../domain/categoria.entity.js";

export class CategoriaMapper {
    static mapSimple(record: CategoriaProducto): CategoriaSimple {
        return {
            id: record.id,
            categoria: record.categoria,
            default_categoria: record.default_categoria,
            activo: record.activo,
            categoria_padre_id: record.categoria_padre_id || undefined,
        };
    }
}
```

### 3. Backend Prisma Repository (`infrastructure/prisma-<entidad>.repository.ts`)
```typescript
import type { PrismaClient } from "@prisma/client";
import type { CategoriaActualizar, CategoriaCrear, CategoriaSimple } from "../domain/categoria.entity.js";
import type { CategoriaRepository } from "../domain/categoria.repository.js";
import { CategoriaMapper } from "./mappers/categoria.mapper.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";
import type { Pagination } from "@shared/domain/pagination.js";
import type { Paginated } from "@shared/domain/paginated.js";

export class PrismaCategoriaRepository implements CategoriaRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async obtener(id: string, negocio_id: string): Promise<CategoriaSimple | null> {
        try {
            const record = await this.prisma.categoriaProducto.findFirst({
                where: { id, negocio_id, activo: true },
            });
            if (!record) return null;
            return CategoriaMapper.mapSimple(record);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(negocio_id: string, pagination: Pagination, q?: string | null): Promise<Paginated<CategoriaSimple>> {
        try {
            const { page, perPage } = pagination;
            const offset = (page - 1) * perPage;

            const where: any = { activo: true, negocio_id };
            if (q) {
                where.categoria = { contains: q };
            }

            const [total, rows] = await Promise.all([
                this.prisma.categoriaProducto.count({ where }),
                this.prisma.categoriaProducto.findMany({
                    where,
                    take: perPage,
                    skip: offset,
                    orderBy: { categoria: "asc" },
                }),
            ]);

            return {
                data: rows.map((r) => CategoriaMapper.mapSimple(r)),
                total,
                page,
                perPage,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async registrar(data: CategoriaCrear, negocio_id: string): Promise<CategoriaSimple> {
        try {
            const created = await this.prisma.categoriaProducto.create({
                data: {
                    ...data,
                    negocio_id,
                    activo: true,
                },
            });
            return CategoriaMapper.mapSimple(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizar(id: string, data: CategoriaActualizar, negocio_id: string): Promise<CategoriaSimple> {
        try {
            const updated = await this.prisma.categoriaProducto.update({
                where: { id, negocio_id, activo: true },
                data,
            });
            return CategoriaMapper.mapSimple(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async eliminar(id: string, negocio_id: string): Promise<void> {
        try {
            const result = await this.prisma.categoriaProducto.updateMany({
                where: { id, negocio_id, activo: true },
                data: { activo: false },
            });
            if (result.count === 0) {
                throw new NotFoundPersistenceError();
            }
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }
}
```

### 4. Frontend Axios Repository (`saas-frontend/src/modules/<modulo>/infrastructure/repositories/<entidad>.repository.ts`)
```typescript
import api from "../../../../core/api/api";
import type { CategoriasResponse, CategoriaDetailResponse } from "../../domain/interfaces/categoria.interface";
import type { CategoriaFormValues } from "../../domain/schemas/categoria.schema";

const URL_MODULE = "/categorias/";

export const CategoriaRepository = {
    listar: async (limit: number = 10, offset: number = 0, q?: string | null, signal?: AbortSignal): Promise<CategoriasResponse> => {
        const params: Record<string, unknown> = { limit, offset };
        if (q) params.q = q;

        return await api.get<CategoriasResponse>(URL_MODULE, { params, signal });
    },

    obtener: async (id: string): Promise<CategoriaDetailResponse["data"]> => {
        const response = await api.get<CategoriaDetailResponse>(`${URL_MODULE}${id}`);
        return response.data;
    },

    registrar: async (data: CategoriaFormValues) => {
        const response = await api.post(URL_MODULE, data);
        return response.data;
    },

    actualizar: async (id: string, data: Partial<CategoriaFormValues>) => {
        const response = await api.put(`${URL_MODULE}${id}`, data);
        return response.data;
    },

    eliminar: async (id: string) => {
        const response = await api.delete(`${URL_MODULE}${id}`);
        return response.data;
    },
};
```
