---
name: create-entity-and-schema
description: Creates or updates Domain Entities, DTO interfaces, and Zod validation schemas in both saas-backend and saas-frontend.
---

# Skill: Create Entity and Schema (`create-entity-and-schema`)

## What It Does
Defines domain entities (`*.entity.ts`), request validation schemas (`*.schema.ts`) using **Zod**, and frontend TypeScript interfaces (`*.interface.ts`) so that data contracts remain strictly typed and consistent between `saas-backend` and `saas-frontend`.

## Locations & Naming Conventions
- **Backend Entity**: `saas-backend/src/modules/<modulo>/domain/<entidad>.entity.ts`
- **Backend Request Validator Schema**: `saas-backend/src/modules/<modulo>/presentation/validators/<entidad>.schema.ts`
- **Frontend Domain Interface**: `saas-frontend/src/modules/<modulo>/domain/interfaces/<entidad>.interface.ts`
- **Frontend Form Schema**: `saas-frontend/src/modules/<modulo>/domain/schemas/<entidad>.schema.ts`

## Restrictions & Rules
1. **Pure Domain Entities**: `domain/<entidad>.entity.ts` must only contain TypeScript `interface` or `type` declarations (and pure domain value logic if needed). Never import Prisma or Express types here.
2. **Standard Entity Variants**:
   - `<Entidad>`: Full domain representation (includes `id`, `negocio_id`, `activo`, etc.).
   - `<Entidad>Crear`: `Omit<Entidad, "id" | "negocio_id" | "activo">` (with optional defaults where appropriate).
   - `<Entidad>Actualizar`: `Partial<Omit<Entidad, "id" | "negocio_id">>`.
   - `<Entidad>Simple`: `Omit<Entidad, "negocio_id">` for safe external responses without exposing internal tenant fields unnecessarily.
3. **Zod Validation**:
   - Trim strings (`.trim()`) and provide clear Spanish validation error messages.
   - Validate UUID foreign keys with `.uuid('Mensaje claro')`.
   - For update schemas, use `.partial()` on the creation schema or define explicit optional fields.

## Implementation Examples

### 1. Backend Domain Entity (`saas-backend/src/modules/<modulo>/domain/<entidad>.entity.ts`)
```typescript
export interface Categoria {
    id: string;
    negocio_id: string;
    categoria: string;
    default_categoria: boolean;
    activo: boolean;
    categoria_padre_id?: string;
}

export interface CategoriaCrear extends Omit<Categoria, "id" | "negocio_id" | "activo" | "default_categoria"> {
    default_categoria?: boolean;
    activo?: boolean;
    categoria_padre_id?: string;
}

export interface CategoriaActualizar extends Partial<Omit<Categoria, "id" | "negocio_id">> {}

export interface CategoriaSimple extends Omit<Categoria, "negocio_id"> {}
```

### 2. Backend Presentation Validator (`saas-backend/src/modules/<modulo>/presentation/validators/<entidad>.schema.ts`)
```typescript
import { z } from "zod";

export const categoriaCrearSchema = z.object({
    categoria: z
        .string({ message: "El nombre de la categoría es obligatorio" })
        .trim()
        .min(2, "La categoría debe tener al menos 2 caracteres")
        .max(100, "La categoría no puede exceder 100 caracteres"),
    categoria_padre_id: z
        .string({ message: "La categoría padre es obligatoria" })
        .uuid("El ID de la categoría padre debe ser un UUID válido"),
});

export const categoriaActualizarSchema = categoriaCrearSchema.partial();
```

### 3. Frontend Domain Interfaces (`saas-frontend/src/modules/<modulo>/domain/interfaces/<entidad>.interface.ts`)
```typescript
import type { ApiResponse, PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";

export interface Categoria {
    id: string;
    categoria: string;
    default_categoria: boolean;
    activo: boolean;
    categoria_padre_id?: string;
}

export type CategoriaDetailResponse = ApiResponse<Categoria>;
export type CategoriasResponse = PaginatedResponse<Categoria>;
```

### 4. Frontend Form Schema (`saas-frontend/src/modules/<modulo>/domain/schemas/<entidad>.schema.ts`)
```typescript
import z from "zod";

export const categoriaSchema = z.object({
    categoria: z.string().trim().min(3, "La categoría debe tener al menos 3 caracteres"),
    categoria_padre_id: z.string().uuid("Debe seleccionar una categoría padre válida"),
});

export type CategoriaFormValues = z.infer<typeof categoriaSchema>;
```
