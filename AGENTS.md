# AGENTS.md — Punto de Entrada e Índice Maestro de Orquestación

> **LECTURA OBLIGATORIA**: Cualquier modelo o agente de IA que interactúe con este repositorio **DEBE** leer este archivo antes de analizar, planificar o escribir una sola línea de código. Este documento actúa como el índice maestro que define qué agente ejecutar, qué skills aplicar, cuáles son las restricciones generales y cómo funciona el ciclo de desarrollo.

---

## 1. Reglas y Restricciones Generales (Inquebrantables)

1. **Prohibido Codear sin Consultar Contexto**:
   - Antes de empezar a tocar código, **DEBES** revisar:
     1. [`.agents/MEMORY.md`](file:///Applications/presupuesto/.agents/MEMORY.md) para conocer el estado actual del Backend, Frontend, Base de Datos, Herramientas y APIs.
     2. Los agentes disponibles en `.agents/agents/*/SKILL.md`.
     3. Las skills técnicas disponibles en `.agents/skills/*/SKILL.md`.
2. **Respeto Estricto a Clean Architecture**:
   - Tanto `backend` como `frontend` siguen una arquitectura modular dividida en `domain`, `application` (backend), `infrastructure` y `presentation`.
   - Está prohibido saltar capas (por ejemplo, importar `@prisma/client` en un controlador o caso de uso, o hacer llamadas directas con `axios` dentro de un componente React sin pasar por su repositorio/servicio).
3. **Aislamiento Multi-Tenant (`teamId`) y Control de Roles (`verifyTeamRole`)**:
   - Toda consulta o mutación de datos pertenecientes a un equipo debe aislarse por `teamId` y validar permisos mediante `verifyTeamRole(['OWNER', 'EDITOR', 'VIEWER'])` (nunca confiar en el cliente sin validar membresía en el equipo).
4. **Precisión Financiera (`decimal.js`)**:
   - En `backend`, todo cálculo monetario, asignación de rubros, totales de ingresos/gastos y cierres de presupuesto (`BudgetClosing`) debe realizarse usando `decimal.js` (prohibido usar aritmética flotante nativa de JS para montos financieros).
5. **ESM con Extensión `.js` en Backend**:
   - En `backend`, todas las importaciones relativas o mediante path aliases (`@shared/*`, `@app/*`, `@infrastructure/*`, `@modules/*`) deben incluir la extensión `.js`.
6. **Frontend Modular y Estética (`DESIGN.md` + Límite de 150 Líneas)**:
   - El `frontend` utiliza React 19, MUI v7 estilizado conforme a [`frontend/DESIGN.md`](file:///Applications/presupuesto/frontend/DESIGN.md), Tailwind CSS, React Query y Zustand.
   - **Todo componente React en `frontend` debe tener <= 150 líneas**, salvo casos estrictamente inevitables; si crece, debe dividirse en subcomponentes o hooks personalizados.
7. **Separación de Responsabilidades (Nadie se auto-aprueba)**:
   - El `coder` nunca declara su propio trabajo como verificado. Todo cambio de código debe ser validado por el `tester` con salida real de comandos (`tsc`, `build`, `lint` o tests).
8. **Actualización de Memoria**:
   - Al finalizar y verificar cualquier requerimiento, se debe actualizar [`.agents/MEMORY.md`](file:///Applications/presupuesto/.agents/MEMORY.md) reflejando los nuevos endpoints, modelos, módulos o cambios realizados.

---

## 2. Índice de Agentes Disponibles (`.agents/agents/`)

| Agente | Archivo de Definición | Rol Principal | ¿Cuándo activarlo? |
| :--- | :--- | :--- | :--- |
| **Manager** | [`.agents/agents/manager/SKILL.md`](file:///Applications/presupuesto/.agents/agents/manager/SKILL.md) | Arquitecto y Orquestador. Analiza el prompt del usuario, revisa `MEMORY.md`, diseña el plan técnico, crea tareas estructuradas (`#Task-XX`), selecciona qué `skills` deben usarse, levanta a los agentes `coder`, coordina con `tester` y actualiza `MEMORY.md`. | **Siempre como primer paso** ante cualquier prompt de nueva funcionalidad, refactorización, módulo nuevo o requerimiento de múltiples pasos. |
| **Coder** | [`.agents/agents/coder/SKILL.md`](file:///Applications/presupuesto/.agents/agents/coder/SKILL.md) | Implementador / Investigador. Trabaja exactamente **una tarea o issue a la vez** en modo `triage` (diagnóstico sin cambios) o `implement` (implementación siguiendo las `skills`). Entrega salida real de comandos como evidencia. | Cuando el `manager` (o el usuario con un `#issue` puntual) asigna un brief estructurado para diagnosticar o picar código. |
| **Tester** | [`.agents/agents/tester/SKILL.md`](file:///Applications/presupuesto/.agents/agents/tester/SKILL.md) | Auditor de Calidad y QA. Verifica el trabajo del `coder` contra los criterios de aceptación del `manager`, audita el cumplimiento de las `skills`, ejecuta compilación TypeScript/linter/tests y aprueba (`VERIFIED`) o devuelve el trabajo al `coder` (`REWORK_REQUIRED`). | Inmediatamente después de que un `coder` termina de implementar o corregir una tarea. |

---

## 3. Índice de Skills Técnicas Disponibles (`.agents/skills/`)

Antes de implementar cualquier parte del sistema, el `manager` debe indicar en el brief qué skills aplican y el `coder` debe leerlas y seguir sus plantillas y restricciones:

| Skill | Archivo de Definición | Qué hace y cuándo usarla |
| :--- | :--- | :--- |
| **`create-entity-and-schema`** | [`.agents/skills/create-entity-and-schema/SKILL.md`](file:///Applications/presupuesto/.agents/skills/create-entity-and-schema/SKILL.md) | Creación/edición de entidades de dominio (`domain/*.entity.ts`), validadores Zod en backend (`presentation/validators/*.schema.ts`), e interfaces/schemas Zod en frontend (`domain/interfaces/` y `domain/schemas/`). |
| **`create-repository`** | [`.agents/skills/create-repository/SKILL.md`](file:///Applications/presupuesto/.agents/skills/create-repository/SKILL.md) | Creación/edición de contratos de repositorio (`domain/*.repository.ts`), implementaciones Prisma con `PrismaErrorMapper` (`infrastructure/prisma-*.repository.ts`), mappers (`infrastructure/mappers/*.mapper.ts`) y repositorios Axios en frontend (`infrastructure/repositories/*.repository.ts`). |
| **`create-use-case`** | [`.agents/skills/create-use-case/SKILL.md`](file:///Applications/presupuesto/.agents/skills/create-use-case/SKILL.md) | Creación/edición de casos de uso en `backend/src/modules/<modulo>/application/*.usecase.ts`, inyección de repositorios, manejo de transacciones y mapeo de errores a `AppError`. |
| **`create-controller-and-routes`** | [`.agents/skills/create-controller-and-routes/SKILL.md`](file:///Applications/presupuesto/.agents/skills/create-controller-and-routes/SKILL.md) | Creación/edición de controladores (`BaseController`, `Respuesta.exito` / `Respuesta.paginacion`), rutas Express (`AuthMiddleware`, `ValidarMiddleware`), inyección de dependencias en `<modulo>.module.ts` y registro en `src/routes/index.routes.ts`. |
| **`create-frontend-module`** | [`.agents/skills/create-frontend-module/SKILL.md`](file:///Applications/presupuesto/.agents/skills/create-frontend-module/SKILL.md) | Creación/edición de módulos en `frontend/src/modules/<modulo>/` (páginas React 19 + MUI v7 siguiendo `frontend/DESIGN.md`, formularios con `react-hook-form` + `zod`, hooks personalizados, rutas lazy y componentes <= 150 líneas). |

---

## 4. Ciclo de Ejecución y Orquestación (Cómo Procesar un Prompt del Usuario)

Cada vez que el usuario envía un prompt solicitando una funcionalidad, cambio o corrección, sigue este flujo paso a paso:

```mermaid
flowchart TD
    UserPrompt["1. Prompt del Usuario"] --> ReadIndex["2. Leer AGENTS.md y .agents/MEMORY.md"]
    ReadIndex --> ManagerPlan["3. Agente MANAGER: Analiza, crea Plan y Tareas (#Task-01...) e identifica Skills"]
    ManagerPlan --> SpawnCoder["4. Agente CODER: Lee las Skills asignadas y ejecuta la Tarea (triage o implement)"]
    SpawnCoder --> TesterVerify["5. Agente TESTER: Audita código, verifica criterios y ejecuta tsc / build / tests"]
    TesterVerify -->|REWORK_REQUIRED (Falló)| ReworkBrief["Tester envía reporte de errores al Coder"]
    ReworkBrief --> SpawnCoder
    TesterVerify -->|VERIFIED (Aprobado)| UpdateMemory["6. Agente MANAGER: Actualiza .agents/MEMORY.md y entrega reporte final al usuario"]
```

### Paso a Paso Detallado del Ciclo:

1. **Recepción del Prompt y Lectura de Contexto**:
   - El agente inicial asume el rol de **`manager`** ([`.agents/agents/manager/SKILL.md`](file:///Applications/presupuesto/.agents/agents/manager/SKILL.md)).
   - Consulta [`.agents/MEMORY.md`](file:///Applications/presupuesto/.agents/MEMORY.md) para ubicar los módulos existentes en `backend`, `frontend` y `backend/prisma/schema.prisma`.

2. **Planificación y Estructuración (`Manager`)**:
   - El `manager` divide el requerimiento en tareas atómicas (`#Task-01`, `#Task-02`, etc.).
   - Para cada tarea genera un **Task Brief** estructurado indicando:
     - Modo (`triage` o `implement`).
     - Capa afectada (`Backend`, `Frontend`, `DB`).
     - Archivos objetivo.
     - **Skills obligatorias** de `.agents/skills/` que el `coder` debe seguir.
     - Criterios de aceptación verificables.

3. **Implementación (`Coder`)**:
   - El `manager` levanta/delega la tarea al agente **`coder`** ([`.agents/agents/coder/SKILL.md`](file:///Applications/presupuesto/.agents/agents/coder/SKILL.md)) (si se requieren múltiples tareas independientes, puede levantar varios `coder` o ejecutarlos secuencialmente según dependencias).
   - El `coder` lee las skills indicadas en su brief, implementa únicamente el alcance de su tarea, ejecuta validación local y entrega su reporte con el output real de los comandos ejecutados.

4. **Pruebas y Auditoría (`Tester`)**:
   - El resultado del `coder` pasa al agente **`tester`** ([`.agents/agents/tester/SKILL.md`](file:///Applications/presupuesto/.agents/agents/tester/SKILL.md)).
   - El `tester` audita que el código cumpla las restricciones de las skills (aislamiento por `teamId`, `verifyTeamRole`, `decimal.js`, componentes <= 150 líneas, manejo de errores, tipado estricto, rutas protegidas) y ejecuta los comandos de verificación (`npx tsc --noEmit`, `npm run build`, `npm run lint`, o tests).
   - **Si falla (`REWORK_REQUIRED`)**: El `tester` devuelve un reporte detallado al `coder` indicando archivos, líneas y errores exactos para que el `coder` lo corrija, repitiendo el ciclo `coder -> tester`.
   - **Si pasa (`VERIFIED`)**: El `tester` aprueba la tarea y notifica al `manager`.

5. **Cierre y Registro en Memoria (`Manager`)**:
   - Una vez que todas las tareas están en estado `VERIFIED` por el `tester`, el `manager` actualiza [`.agents/MEMORY.md`](file:///Applications/presupuesto/.agents/MEMORY.md) (documentando nuevos endpoints, modelos, módulos o entrada en el Changelog) y presenta el resumen final al usuario.
