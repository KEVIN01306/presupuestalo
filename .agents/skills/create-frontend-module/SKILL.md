---
name: create-frontend-module
description: Creates or updates a feature module in saas-frontend following the domain/infrastructure/presentation structure with React 19, MUI v7, React Hook Form, Zod, and lazy routing.
---

# Skill: Create Frontend Module (`create-frontend-module`)

## What It Does
Standardizes how feature modules are built in `saas-frontend/src/modules/<modulo>/`, separating domain contracts/schemas, Axios API repositories, and React presentation layers (lazy routes, pages, custom hooks, and reusable UI components).

## Directory Structure
```text
saas-frontend/src/modules/<modulo>/
├── index.ts
├── domain/
│   ├── interfaces/
│   │   └── <entidad>.interface.ts
│   └── schemas/
│       └── <entidad>.schema.ts
├── infrastructure/
│   └── repositories/
│       └── <entidad>.repository.ts
└── presentation/
    ├── <entidad>-lazy.ts
    ├── <entidad>.routes.tsx
    ├── components/
    ├── hooks/
    └── pages/
        ├── <Entidad>ListPage.tsx
        ├── <Entidad>FormPage.tsx
        └── <Entidad>DetailPage.tsx
```

## Restrictions & Rules
1. **No Raw `axios` or `fetch` in Pages/Components**: Components and hooks MUST call methods from `infrastructure/repositories/<entidad>.repository.ts`.
2. **Form Management**: Always use `react-hook-form` with `zodResolver` (`@hookform/resolvers/zod`) and schemas defined in `domain/schemas/<entidad>.schema.ts`.
3. **Notifications / Feedback**: Use `sonner` (`toast.success`, `toast.error`) for user feedback on mutations and error states.
4. **Code Splitting**: Export page components via `React.lazy` in `presentation/<entidad>-lazy.ts` and register routes in `presentation/<entidad>.routes.tsx` with `ProtectedRoute` permissions where applicable.
5. **UI Components**: Use Material UI v7 (`@mui/material`, `@mui/icons-material`) and shared core components from `src/core/` or `src/presentation/` to maintain visual consistency.

## Implementation Examples

### 1. Lazy Page Exports (`presentation/<entidad>-lazy.ts`)
```typescript
import { lazy } from "react";

export const CategoriaListPage = lazy(() => import("./pages/CategoriaListPage"));
export const CategoriaFormPage = lazy(() => import("./pages/CategoriaFormPage"));
export const CategoriaDetailPage = lazy(() => import("./pages/CategoriaDetailPage"));
```

### 2. Module Routes (`presentation/<entidad>.routes.tsx`)
```tsx
import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../../../presentation/routers/ProtectedRoute";
import { CategoriaListPage, CategoriaFormPage, CategoriaDetailPage } from "./categoria-lazy";

export const categoriaRoutes: RouteObject[] = [
    {
        path: "categorias",
        children: [
            {
                index: true,
                element: (
                    <ProtectedRoute requiredPermissions={["VER_CATEGORIAS_PRODUCTOS"]}>
                        <CategoriaListPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "nuevo",
                element: (
                    <ProtectedRoute requiredPermissions={["CREAR_CATEGORIAS_PRODUCTOS"]}>
                        <CategoriaFormPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: ":id/editar",
                element: (
                    <ProtectedRoute requiredPermissions={["EDITAR_CATEGORIAS_PRODUCTOS"]}>
                        <CategoriaFormPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: ":id",
                element: (
                    <ProtectedRoute requiredPermissions={["VER_CATEGORIAS_PRODUCTOS_DETALLE"]}>
                        <CategoriaDetailPage />
                    </ProtectedRoute>
                ),
            },
        ],
    },
];
```
