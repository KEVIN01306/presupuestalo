---
name: create-controller-and-routes
description: Creates or updates Express Controllers, Routes with Auth/Validation middlewares, and Module Dependency Injection wiring in saas-backend.
---

# Skill: Create Controller and Routes (`create-controller-and-routes`)

## What It Does
Defines how to expose Use Cases over HTTP in `saas-backend` using `BaseController`, `Respuesta`, `AuthMiddleware`, `ValidarMiddleware`, and how to wire dependencies in `<modulo>.module.ts` and register the route in `src/routes/index.routes.ts`.

## Locations & Naming Conventions
- **Controller**: `saas-backend/src/modules/<modulo>/presentation/<entidad>.controller.ts`
- **Routes**: `saas-backend/src/modules/<modulo>/presentation/<entidad>.routes.ts`
- **DI Module Wiring**: `saas-backend/src/modules/<modulo>/<entidad>.module.ts`
- **Global Router**: `saas-backend/src/routes/index.routes.ts`

## Restrictions & Rules
1. **Extend `BaseController`**:
   - Every controller MUST extend `BaseController` (`@shared/presentation/base.controller.js`).
   - Extract tenant context (`negocio_id`, `usuario_id`, `sucursal_id`, `rol_id`) exclusively via `this.obtenerEntorno(res)`. Never trust `negocio_id` from `req.body` or `req.query`.
2. **Arrow Function Handlers**:
   - Define controller methods as arrow properties (`obtener = async (req: Request, res: Response, next: NextFunction) => { ... }`) so `this` stays bound when passed to Express routes.
   - Always forward errors to `next(error)` inside `catch (error) { next(error); }`.
3. **Standard HTTP Responses**:
   - Single / action responses: `res.status(200|201).json(Respuesta.exito('Mensaje', data))`
   - Paginated responses: read `const { limit, offset, q } = res.locals.query;`, compute `const page = Math.floor(offset / limit) + 1;`, and return `res.status(200).json(Respuesta.paginacion('Mensaje', data, total, limit, offset))`.
4. **Route Security & Validation**:
   - Always apply `router.use(authMiddleware.protegerRuta);` at the top of protected routers.
   - Enforce granular permissions on every route using `authMiddleware.verificarPermiso(['PERMISO_REQUERIDO'])` or `authMiddleware.verificarRol([...])`.
   - Validate request payloads with `validarMiddleware.validarBody(schema)` and query params with `validarMiddleware.validarQuery(querySchema)`.

## Implementation Examples

### 1. Controller (`presentation/<entidad>.controller.ts`)
```typescript
import type { NextFunction, Request, Response } from "express";
import BaseController from "@shared/presentation/base.controller.js";
import Respuesta from "@app/http/respuesta.js";
import type { ObtenerCategoriaUseCase } from "../application/obtener-categoria.usecase.js";
import type { ObtenerCategoriasUseCase } from "../application/obtener-categorias.usecase.js";
import type { RegistrarCategoriaUseCase } from "../application/registrar-categoria.usecase.js";
import type { ActualizarCategoriaUseCase } from "../application/actualizar-categoria.usecase.js";
import type { EliminarCategoriaUseCase } from "../application/eliminar-categoria.usecase.js";

export class CategoriaController extends BaseController {
    constructor(
        private readonly obtenerCategoriaUseCase: ObtenerCategoriaUseCase,
        private readonly obtenerCategoriasUseCase: ObtenerCategoriasUseCase,
        private readonly registrarCategoriaUseCase: RegistrarCategoriaUseCase,
        private readonly actualizarCategoriaUseCase: ActualizarCategoriaUseCase,
        private readonly eliminarCategoriaUseCase: EliminarCategoriaUseCase
    ) {
        super();
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const data = await this.obtenerCategoriaUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito("Categoría obtenida con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { limit, offset, q } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const { total, data } = await this.obtenerCategoriasUseCase.execute(
                negocio_id,
                { page, perPage: limit },
                q
            );
            res.status(200).json(Respuesta.paginacion("Categorías obtenidas con éxito", data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    };

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const data = await this.registrarCategoriaUseCase.execute(req.body, negocio_id);
            res.status(201).json(Respuesta.exito("Categoría creada con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const data = await this.actualizarCategoriaUseCase.execute(id, negocio_id, req.body);
            res.status(200).json(Respuesta.exito("Categoría actualizada con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            await this.eliminarCategoriaUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito("Categoría eliminada con éxito", null));
        } catch (error) {
            next(error);
        }
    };
}
```

### 2. Routes (`presentation/<entidad>.routes.ts`)
```typescript
import { Router } from "express";
import { z } from "zod";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";
import { categoriaController } from "../categoria.module.js";
import { categoriaCrearSchema, categoriaActualizarSchema } from "./validators/categoria.schema.js";

const listQuerySchema = paginacionQuerySchema.extend({
    q: z.string().trim().optional(),
});

const router = Router();
const validarMiddleware = new ValidarMiddleware();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.protegerRuta);

router.post(
    "/",
    authMiddleware.verificarPermiso(["CREAR_CATEGORIAS_PRODUCTOS"]),
    validarMiddleware.validarBody(categoriaCrearSchema),
    categoriaController.registrar
);

router.get(
    "/",
    authMiddleware.verificarPermiso(["VER_CATEGORIAS_PRODUCTOS"]),
    validarMiddleware.validarQuery(listQuerySchema),
    categoriaController.listar
);

router.get(
    "/:id",
    authMiddleware.verificarPermiso(["VER_CATEGORIAS_PRODUCTOS_DETALLE"]),
    categoriaController.obtener
);

router.put(
    "/:id",
    authMiddleware.verificarPermiso(["EDITAR_CATEGORIAS_PRODUCTOS"]),
    validarMiddleware.validarBody(categoriaActualizarSchema),
    categoriaController.actualizar
);

router.delete(
    "/:id",
    authMiddleware.verificarRol(["ELIMINAR_CATEGORIAS_PRODUCTOS"]),
    categoriaController.eliminar
);

export default router;
```

### 3. Dependency Injection Wiring (`<entidad>.module.ts`)
```typescript
import prisma from "@infrastructure/config/prisma.js";
import { PrismaCategoriaRepository } from "./infrastructure/prisma-categoria.repository.js";
import { ObtenerCategoriaUseCase } from "./application/obtener-categoria.usecase.js";
import { ObtenerCategoriasUseCase } from "./application/obtener-categorias.usecase.js";
import { RegistrarCategoriaUseCase } from "./application/registrar-categoria.usecase.js";
import { ActualizarCategoriaUseCase } from "./application/actualizar-categoria.usecase.js";
import { EliminarCategoriaUseCase } from "./application/eliminar-categoria.usecase.js";
import { CategoriaController } from "./presentation/categoria.controller.js";

const repository = new PrismaCategoriaRepository(prisma);

const obtenerUseCase = new ObtenerCategoriaUseCase(repository);
const listarUseCase = new ObtenerCategoriasUseCase(repository);
const registrarUseCase = new RegistrarCategoriaUseCase(repository);
const actualizarUseCase = new ActualizarCategoriaUseCase(repository);
const eliminarUseCase = new EliminarCategoriaUseCase(repository);

export const categoriaController = new CategoriaController(
    obtenerUseCase,
    listarUseCase,
    registrarUseCase,
    actualizarUseCase,
    eliminarUseCase
);
```
