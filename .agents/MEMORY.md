# MEMORY.md — Estado del Proyecto (`/Applications/presupuesto`)

> **Última actualización**: 2026-11-12
> **Propósito**: Fuente de verdad sobre la arquitectura, esquema de base de datos, módulos activos, catálogo de APIs y estado de tareas del sistema de control de gastos y presupuestos colaborativos.

---

## 1. Visión General del Proyecto

Plataforma web multi-usuario para la gestión de **presupuestos personales y colaborativos en equipo (`Team`)**, control de ingresos por categorías (`IncomeCategory`), proyección de rubros (`BudgetItem`) con división opcional por miembro (`BudgetItemAllocation`), registro de gastos reales (`Expense`) con bloqueos de límites individuales y globales, dashboard analítico en tiempo real, cierre de presupuesto (`BudgetClosing`) con ahorro y arrastre inteligente de sobrantes (`carryover`) entre periodos, auditoría (`AuditLog`) y autenticación híbrida (Email/Password + Google OAuth).

---

## 2. Stack Tecnológico

- **Backend (`/Applications/presupuesto/backend`)**:
  - Node.js + Express 5 + TypeScript (ESM con extensión `.js` en imports)
  - Prisma ORM (`@prisma/client` v6.19.2) + MySQL
  - Validación con Zod (`zod` v4)
  - Precisión financiera con `decimal.js`
  - Autenticación con `jose` (JWT), `bcryptjs` (con soporte legacy `$argon2`), y `google-auth-library` (`OAuth2Client`)
- **Frontend (`/Applications/presupuesto/frontend`)**:
  - React 19 + TypeScript + Vite
  - UI: MUI (`@mui/material`, `@mui/icons-material`) estilizado conforme a [`frontend/DESIGN.md`](file:///Applications/presupuesto/frontend/DESIGN.md) (paleta Google for Education light: `#f8f9fa`, `#202124`, `#3c4043`, `#5f6368`, `#dadce0`, `#1a73e8`, `#188038`, botones pill `200px`, cards `24px`, modales `8px`, sin sombras pesadas)
  - Formularios y validación: `react-hook-form` + `@hookform/resolvers` + `zod`
  - Estado, HTTP y OAuth: `zustand`, `axios` (header `x-team-id` + refresh token), `@react-oauth/google`
  - Regla de modularidad: **<= 150 líneas por componente React** (salvo casos inevitables).

---

## 3. Esquema de Base de Datos (`backend/prisma/schema.prisma`)

### Enums
- `AuditAction`: `LOGIN`, `LOGOUT`, `CREATE`, `UPDATE`, `DELETE`
- `TeamRole`: `OWNER`, `EDITOR`, `VIEWER`
- `BudgetStatus`: `ACTIVE`, `CLOSED`

### Modelos
1. **`User`** (`users`): `id`, `email`, `passwordHash?`, `googleId?`, `firstName`, `lastName`, `avatarUrl?`, `isActive`, `isVerify`, `createdAt`, `updatedAt`
2. **`UserSession`** (`user_sessions`): `id`, `userId` (unique), `token`, `expiresAt`, `createdAt`
3. **`Team`** (`teams`): `id`, `name`, `description?`, `isPersonal`, `ownerId`, `currencyId?`, `createdAt`, `updatedAt`
4. **`Currency`** (`currencies`): `id`, `code` (`@unique`), `name`, `symbol`, `isActive`, `createdAt`, `updatedAt` (seed: `GTQ`, `USD`, `HNL`, `NIO`, `CRC`, `PAB`, `MXN`; default en Teams: `USD`)
4. **`TeamMember`** (`team_members`): `id`, `teamId`, `userId`, `role` (`TeamRole`), `joinedAt` (`@@unique([teamId, userId])`)
5. **`IncomeCategory`** (`income_categories`): `id`, `teamId`, `name`, `isSystem`, `createdAt` (`@@unique([teamId, name])`)
6. **`Income`** (`incomes`): `id`, `budgetId`, `categoryId`, `userId`, `amount` (`Decimal(12,2)`), `description?`, `isCarryover`, `date`, `createdAt`, `updatedAt`
7. **`Budget`** (`budgets`): `id`, `teamId`, `name`, `startDate`, `endDate`, `status` (`BudgetStatus`), `createdAt`, `updatedAt`
8. **`BudgetItem`** (`budget_items`): `id`, `budgetId`, `name`, `projectedAmount` (`Decimal(12,2)`), `hasUserSplit`, `createdAt`, `updatedAt`
9. **`BudgetItemAllocation`** (`budget_item_allocations`): `id`, `budgetItemId`, `userId`, `assignedAmount` (`Decimal(12,2)`) (`@@unique([budgetItemId, userId])`)
10. **`Expense`** (`expenses`): `id`, `budgetItemId`, `paidByUserId`, `createdByUserId`, `amount` (`Decimal(12,2)`), `date`, `description?`, `createdAt`, `updatedAt`
11. **`BudgetClosing`** (`budget_closings`): `id`, `budgetId` (unique), `totalIncome`, `totalSpent`, `totalRemainder`, `savedAmount`, `carriedOverAmount`, `isCarryoverProcessed`, `closedAt`
12. **`BudgetClosingUserRemainder`** (`budget_closing_user_remainders`): `id`, `budgetClosingId`, `userId`, `contributedIncome`, `totalSpent`, `remainderAmount` (`@@unique([budgetClosingId, userId])`)
13. **`AuditLog`** (`audit_logs`): `id`, `userId?`, `action`, `resource`, `resourceId?`, `details` (`Json?`), `createdAt`

---

## 4. Módulos y Catálogo de APIs

### Backend (`backend/src/modules/`)
- **Eliminados**: `Assets`, `Brands`, `Folders`, `Roles`
- **Middleware de Seguridad**: [`Auth.middleware.ts`](file:///Applications/presupuesto/backend/src/app/middleware/Auth.middleware.ts) (`protegerRuta` + `verifyTeamRole(allowedRoles)` resolviendo `teamId` desde params, body, query, `x-team-id`, o `:budgetId`/`:itemId`/`:expenseId`/`:incomeId`/`:categoryId`).
- **`Auth`** (`/api/auth`): `POST /register`, `POST /login`, `POST /google` (`google-auth-library`), `POST /refresh`, `POST /logout`, `GET /me`. Onboarding transaccional crea `User`, `Team` personal (`isPersonal: true`), `TeamMember` (`OWNER`), e `IncomeCategory` iniciales (`"Salario mensual"`, `"Sobrante presupuesto anterior"` con `isSystem: true`).
- **`Users`** (`/api/users`): `GET /me`, `PUT /me`, `PATCH /me/password`, `GET /lookup?email=...`, CRUD usuarios.
- **`Audit`** (`/api/audit`, `/api/audit-logs`): Consulta de `AuditLog` filtrada al usuario autenticado.
- **`Teams`** (`/api/teams`): `GET /`, `POST /` (crea Team compartido con moneda `USD` por defecto + `OWNER` + categorías iniciales), `GET /:teamId`, `PUT /:teamId` (`OWNER` puede editar `name`, `description`, `currencyId`), `DELETE /:teamId` (protege `isPersonal`), `POST /:teamId/members`, `PATCH /:teamId/members/:memberId`, `DELETE /:teamId/members/:memberId`.
- **`Currencies`** (`/api/currencies`): `GET /` (lista monedas activas ordenadas por `code`).
- **`IncomeCategories`** (`/api/teams/:teamId/income-categories`): `GET /`, `POST /`, `PUT /:categoryId`, `DELETE /:categoryId` (protege `isSystem: true` y `P2003` FK).
- **`Budgets`** (`/api/teams/:teamId/budgets` y `/api/budgets`):
  - `GET /teams/:teamId/budgets`, `GET /teams/:teamId/budgets/pending-carryover`, `POST /teams/:teamId/budgets`
  - `GET /budgets/:budgetId`, `PUT /budgets/:budgetId`, `DELETE /budgets/:budgetId`
  - `POST /budgets/:budgetId/apply-carryover` (transaccional: crea `Income` con `isCarryover: true` y marca `isCarryoverProcessed: true`)
  - `GET /budgets/:budgetId/summary` (proyección global, resumen usuario actual, segmentación por miembro, progreso por rubro)
  - `POST /budgets/:budgetId/close` (crea `BudgetClosing` + `BudgetClosingUserRemainder[]` y marca `CLOSED`)
- **`Incomes`** (`/api/budgets/:budgetId/incomes` y `/api/incomes`): `GET /`, `POST /`, `PUT /:incomeId`, `DELETE /:incomeId` (valida `ACTIVE` y techo `totalIncome >= totalProjected`).
- **`BudgetItems`** (`/api/budgets/:budgetId/items` y `/api/budget-items`): `GET /`, `POST /`, `PUT /:itemId`, `DELETE /:itemId` (valida techo presupuestario `sum(projectedAmount) <= totalIncome` y asignaciones `sum(assignedAmount) <= projectedAmount`).
- **`Expenses`** (`/api/budgets/:budgetId/expenses` y `/api/expenses`): `GET /`, `POST /`, `PUT /:expenseId`, `DELETE /:expenseId` (bloqueo individual si `hasUserSplit = true`, bloqueo global si `hasUserSplit = false`).

### Frontend (`frontend/src/modules/`)
- **Eliminados**: `brands`, `directorios`, `roles`
- **`auth`**: Login email/password, Registro, Google OAuth (`GoogleAuthButton.tsx`), `authStore` con `activeTeamId` + `activeRole` + `switchTeam`.
- **`profile`**: Perfil de usuario + lista de Teams (`ProfileHeaderCard`, `ProfileDetailsCard`, `ProfileTeamsCard`, `ProfileEditDialog`).
- **`teams`**: Gestión de Teams compartidos/personales, cambio de equipo activo, miembros (`OWNER`/`EDITOR`/`VIEWER`) y categorías de ingresos (`IncomeCategoriesCard`).
- **`budgets`** + **`Dashboard.page.tsx`**: Lista de presupuestos, creación mensual/personalizada, modal de sobrante previo (`CarryoverModal`), dashboard en tiempo real (`PersonalSummaryCard`, `GlobalProjectionCard`, `MemberSegmentationTable`, `ItemProgressList`), pestañas de Ingresos, Rubros Proyectados (ocultando `hasUserSplit` cuando `membersCount <= 1`), Gastos Reales y Cierre de Presupuesto (`BudgetClosingTab`).
- **`audit`**: Consulta y detalle de `AuditLog`.

---

## 5. Estado de Tareas y Changelog

- **#Task-01** (`VERIFIED`): Limpieza del repositorio, actualización de `AGENTS.md`/`CLAUDE.md`/`MEMORY.md`, eliminación de módulos obsoletos, instalación de dependencias y `prisma generate`.
- **#Task-02** (`VERIFIED`): Backend `Auth.middleware.ts` (`protegerRuta` + `verifyTeamRole`), `Auth` (Email/Password + Google OAuth + onboarding transaccional), `Users`, `Audit` y `prisma/seed.ts`.
- **#Task-03** (`VERIFIED`): Backend módulos `Teams` e `IncomeCategories` con aislamiento `teamId`, RBAC y `AuditLog`.
- **#Task-04** (`VERIFIED`): Backend módulos `Budgets`, `Incomes` y detección/aplicación de `carryover` con `decimal.js`.
- **#Task-05** (`VERIFIED`): Backend módulos `BudgetItems` (techo presupuestario + `hasUserSplit` allocations) y `Expenses` (reglas de bloqueo individual y global) con `decimal.js`.
- **#Task-06** (`VERIFIED`): Backend `GET /api/budgets/:budgetId/summary` y `POST /api/budgets/:budgetId/close` (`BudgetClosing` + `BudgetClosingUserRemainder`).
- **#Task-07** (`VERIFIED`): Frontend Theme MUI (`frontend/DESIGN.md` Google for Education), `authStore` + `TeamSwitcher`, `GoogleOAuthProvider`, `auth`, `profile` y layout principal.
- **#Task-08** (`VERIFIED`): Frontend módulos `teams` (CRUD + miembros + categorías de ingreso) y `audit` (<= 150 líneas por `.tsx`).
- **#Task-09** (`VERIFIED`): Frontend módulo `budgets`, `Dashboard.page.tsx`, `CarryoverModal`, `Incomes`, `BudgetItems` (ocultando `hasUserSplit` con 1 miembro), `Expenses` y `BudgetClosing` (<= 150 líneas por `.tsx`).
- **#Task-10** (`VERIFIED`): Backend CORS en `backend/src/app.ts` actualizado para permitir el header `x-team-id` en peticiones preflight desde `http://localhost:4001`.
- **#Task-11** (`VERIFIED`): Modelo `Currency` (`currencies`) y `Team.currencyId` en Prisma, `seed.ts` actualizado (creación de usuario comentada, upsert de 7 monedas `GTQ`/`USD`/`HNL`/`NIO`/`CRC`/`PAB`/`MXN`, backfill a `USD`), `npx prisma db push` + `npx prisma db seed` ejecutados, módulo `Currencies` (`GET /api/currencies`), default `USD` en `Auth`/`Teams` y edición de `currencyId` por `OWNER`.
- **#Task-12** (`VERIFIED`): Frontend selector de moneda en `TeamFormDialog` (`OWNER`), chips de moneda en `Teams` y formateo dinámico con `formatCurrency` usando `activeTeam?.currency?.symbol` en `budgets` y `Dashboard.page.tsx` (`<= 150` líneas por `.tsx`).
- **#Task-13** (`VERIFIED`): Backend `GET /api/budgets/:budgetId/summary` ampliado con `analytics` (`dailySpendingByMember`, `weekdaySpending`, `topItems`) calculado con `decimal.js`.
- **#Task-14** (`VERIFIED`): Frontend `chart.js` + `react-chartjs-2` con 3 gráficas (`DailySpendingLineChart`, `WeekdaySpendingRadarChart`, `TopSpentItemsBarChart`) integradas en `Dashboard.page.tsx` y `BudgetSummaryTab.tsx` (`<= 105` líneas por `.tsx`).
- **#Task-15** (`VERIFIED`): Ajustes mobile-first en las 3 gráficas (`minWidth: 0`, `overflow: hidden`, alturas/padding responsivos, etiquetas cortas en celular y `<= 117` líneas por `.tsx`).
- **#Task-16** (`VERIFIED`): Frontend preparado para despliegue en Cloudflare (`wrangler` v4 en `devDependencies`, `wrangler.jsonc`, `public/_headers`, `.env.example` y scripts `deploy` / `deploy:pages` en `frontend/package.json`).
- **#Task-17** (`VERIFIED`): Eliminado `frontend/public/_redirects` que provocaba bucle infinito (`[code: 100324]`) en Cloudflare Workers Assets; el enrutamiento SPA queda cubierto por `"not_found_handling": "single-page-application"` en `wrangler.jsonc`.
- **#Task-18** (`VERIFIED`): `GoogleAuthButton.tsx` (99 líneas) ajustado para móvil con `size="medium"` y ancho dinámico acotado mediante `ResizeObserver` (`200px`–`260px` en `sm` abajo) para evitar desbordamiento en la tarjeta de login.
