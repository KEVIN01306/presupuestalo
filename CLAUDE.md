# CLAUDE.md — Guía Maestra de Contexto y Orquestación de Agentes

> **INSTRUCCIÓN CRÍTICA DE ENTRADA**: Antes de responder con código o modificar cualquier archivo en este repositorio, **DEBES** seguir las reglas, agentes, skills y flujo de trabajo definidos en este documento y en [`AGENTS.md`](file:///Applications/presupuesto/AGENTS.md).

---

## 1. Protocolo Obligatorio Antes de Codear

Cada vez que recibas un prompt del usuario:
1. **Revisa la Memoria del Proyecto**: Lee [`.agents/MEMORY.md`](file:///Applications/presupuesto/.agents/MEMORY.md) para conocer la arquitectura actual de `backend`, `frontend`, el esquema de base de datos MySQL/Prisma (`backend/prisma/schema.prisma`), las integraciones externas y el catálogo de APIs.
2. **Identifica los Agentes en `.agents/agents/`**:
   - [`manager`](file:///Applications/presupuesto/.agents/agents/manager/SKILL.md): Analiza el requerimiento, elabora el plan, estructura las tareas (`#Task-01`, `#Task-02`, ...) y levanta/coordina a los `coder` y al `tester`.
   - [`coder`](file:///Applications/presupuesto/.agents/agents/coder/SKILL.md): Ejecuta una única tarea estructurada a la vez (`triage` o `implement`) siguiendo estrictamente las skills asignadas.
   - [`tester`](file:///Applications/presupuesto/.agents/agents/tester/SKILL.md): Prueba y audita los cambios del `coder`. Si encuentra errores de compilación, lógica o arquitectura, devuelve la tarea al `coder` (`REWORK_REQUIRED`); si todo pasa, la marca como `VERIFIED`.
3. **Consulta las Skills en `.agents/skills/`**:
   - [`create-entity-and-schema`](file:///Applications/presupuesto/.agents/skills/create-entity-and-schema/SKILL.md): Entidades de dominio (`*.entity.ts`), interfaces frontend (`*.interface.ts`) y schemas de validación Zod (`*.schema.ts`).
   - [`create-repository`](file:///Applications/presupuesto/.agents/skills/create-repository/SKILL.md): Contratos de repositorio (`*.repository.ts`), implementaciones Prisma (`prisma-*.repository.ts`), mappers (`*.mapper.ts`) y repositorios Axios en frontend.
   - [`create-use-case`](file:///Applications/presupuesto/.agents/skills/create-use-case/SKILL.md): Casos de uso en `backend/src/modules/<modulo>/application/*.usecase.ts` con manejo de `AppError` y transacciones.
   - [`create-controller-and-routes`](file:///Applications/presupuesto/.agents/skills/create-controller-and-routes/SKILL.md): Controladores (`BaseController`, `Respuesta`), rutas Express (`AuthMiddleware`, `ValidarMiddleware`) e inyección de dependencias en `*.module.ts`.
   - [`create-frontend-module`](file:///Applications/presupuesto/.agents/skills/create-frontend-module/SKILL.md): Módulos React 19 + MUI v7 (`frontend/DESIGN.md`) + Tailwind + React Query + Zustand + React Hook Form + Zod + rutas lazy en `frontend/src/modules/`.

---

## 2. Ciclo de Implementación (`Manager` ➔ `Coder` ➔ `Tester` ➔ `Memory`)

1. **Fase 1 — Planificación (`manager`)**:
   - Toma el prompt del usuario, revisa [`.agents/MEMORY.md`](file:///Applications/presupuesto/.agents/MEMORY.md) y desglosa el requerimiento en tareas estructuradas (`#Task-ID`).
   - Especifica en cada tarea los archivos objetivo, las skills de `.agents/skills/` que se deben usar y los criterios de aceptación.
2. **Fase 2 — Desarrollo (`coder`)**:
   - Levanta al agente `coder` (o tantos `coder` como tareas independientes existan) pasándole el requerimiento estructurado.
   - El `coder` lee las skills correspondientes en `.agents/skills/`, implementa el código respetando la arquitectura limpia, ejecuta los comandos de verificación preliminares y genera su reporte.
3. **Fase 3 — Validación y Retorno (`tester`)**:
   - Levanta al agente `tester` para auditar y probar lo entregado por el `coder`.
   - El `tester` ejecuta `npx tsc --noEmit` / `npm run build` / `npm run lint` o pruebas funcionales:
     - Si hay fallos (`REWORK_REQUIRED`), el `tester` envía el diagnóstico detallado de vuelta al `coder` para que lo corrija y se vuelve a ejecutar la validación.
     - Si todo cumple (`VERIFIED`), aprueba la tarea ante el `manager`.
4. **Fase 4 — Actualización de Memoria (`manager`)**:
   - Una vez que el `tester` aprueba todas las tareas, actualiza [`.agents/MEMORY.md`](file:///Applications/presupuesto/.agents/MEMORY.md) en su sección correspondiente (Backend, Frontend, DB, Herramientas, APIs y Changelog).

---

## 3. Comandos Rápidos de Verificación del Proyecto

- **Backend (`backend`)**:
  - Verificar tipos / compilar: `cd backend && npx tsc --noEmit` (o `npm run build`)
  - Servidor de desarrollo: `cd backend && npm run dev`
  - Migraciones Prisma: `cd backend && npm run db:migrate`
  - Generar cliente Prisma: `cd backend && npx prisma generate`
- **Frontend (`frontend`)**:
  - Verificar tipos y build: `cd frontend && npm run build`
  - Linter: `cd frontend && npm run lint`
  - Servidor de desarrollo: `cd frontend && npm run dev`

---

## 4. Restricciones Arquitectónicas Clave

- **Multi-Tenant (`teamId`) y RBAC por Equipo**: Nunca ejecutes consultas o mutaciones sobre recursos de un equipo sin filtrar por `teamId` y validar la membresía/rol del usuario mediante `verifyTeamRole(['OWNER', 'EDITOR', 'VIEWER'])`.
- **Precisión Financiera (`decimal.js`)**: Todo cálculo de montos, asignaciones, sobrantes o cierres en `backend` debe usar `decimal.js`.
- **Imports ESM en Backend**: Usa siempre terminación `.js` en los imports dentro de `backend` (ej. `import AppError from "@shared/errors/AppError.js";`).
- **Estandarización de Respuestas**: Usa siempre `Respuesta.exito(...)` / `ResponseHttp.success(...)` y `Respuesta.paginacion(...)` en los controladores del backend.
- **Frontend Design & Modularidad**: Estiliza componentes MUI v7 según [`frontend/DESIGN.md`](file:///Applications/presupuesto/frontend/DESIGN.md) (+ Tailwind, React Query, Zustand) y mantén **cada componente React en <= 150 líneas** salvo que sea estrictamente inevitable.
