import { Router } from "express";
import path from "path";
import express from "express";
import { ErrorMiddleware } from "@app/middleware/Error.middleware.js";
import AuthRoutes from "@modules/Auth/presentation/auth.routes.js";
import UsersRoutes from "@modules/Users/presentation/users.routes.js";
import AuditRoutes from "@modules/Audit/presentation/audit.routes.js";
import TeamsRoutes from "@modules/Teams/presentation/teams.routes.js";
import CurrenciesRoutes from "@modules/Currencies/presentation/currencies.routes.js";
import IncomeCategoriesRoutes from "@modules/IncomeCategories/presentation/income-categories.routes.js";
import TeamBudgetsRoutes from "@modules/Budgets/presentation/team-budgets.routes.js";
import BudgetsRoutes from "@modules/Budgets/presentation/budgets.routes.js";
import BudgetIncomesRoutes from "@modules/Incomes/presentation/budget-incomes.routes.js";
import IncomesRoutes from "@modules/Incomes/presentation/incomes.routes.js";
import BudgetItemsRoutes from "@modules/BudgetItems/presentation/budget-items.routes.js";
import BudgetItemDetailRoutes from "@modules/BudgetItems/presentation/budget-item-detail.routes.js";
import BudgetExpensesRoutes from "@modules/Expenses/presentation/budget-expenses.routes.js";
import ExpensesRoutes from "@modules/Expenses/presentation/expenses.routes.js";

const router = Router();

router.use('/auth', AuthRoutes);
router.use('/users', UsersRoutes);
router.use('/audit', AuditRoutes);
router.use('/audit-logs', AuditRoutes);
router.use('/teams', TeamsRoutes);
router.use('/currencies', CurrenciesRoutes);
router.use('/teams/:teamId/income-categories', IncomeCategoriesRoutes);
router.use('/teams/:teamId/budgets', TeamBudgetsRoutes);
router.use('/budgets/:budgetId/incomes', BudgetIncomesRoutes);
router.use('/budgets/:budgetId/items', BudgetItemsRoutes);
router.use('/budgets/:budgetId/expenses', BudgetExpensesRoutes);
router.use('/budgets', BudgetsRoutes);
router.use('/incomes', IncomesRoutes);
router.use('/budget-items', BudgetItemDetailRoutes);
router.use('/expenses', ExpensesRoutes);

router.use(ErrorMiddleware)

export default router;
