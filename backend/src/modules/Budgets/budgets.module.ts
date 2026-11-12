import prisma from "@infrastructure/config/prisma/prisma.config.js";
import { PrismaTransactionManager } from "@shared/db/database/prisma/PrismaTransactionManager.js";
import { auditLogService } from "@modules/Audit/audit.module.js";
import { PrismaBudgetsRepository } from "./infrastructure/prisma-budgets.repository.js";
import { ListBudgetsUseCase } from "./application/list-budgets.usecase.js";
import { GetPendingCarryoverUseCase } from "./application/get-pending-carryover.usecase.js";
import { CreateBudgetUseCase } from "./application/create-budget.usecase.js";
import { GetBudgetUseCase } from "./application/get-budget.usecase.js";
import { UpdateBudgetUseCase } from "./application/update-budget.usecase.js";
import { DeleteBudgetUseCase } from "./application/delete-budget.usecase.js";
import { ApplyCarryoverUseCase } from "./application/apply-carryover.usecase.js";
import { GetBudgetSummaryUseCase } from "./application/get-budget-summary.usecase.js";
import { CloseBudgetUseCase } from "./application/close-budget.usecase.js";
import { BudgetsController } from "./presentation/budgets.controller.js";

const repository = new PrismaBudgetsRepository(prisma);
const transactionManager = new PrismaTransactionManager(prisma);

const listBudgetsUseCase = new ListBudgetsUseCase(repository);
const getPendingCarryoverUseCase = new GetPendingCarryoverUseCase(repository);
const createBudgetUseCase = new CreateBudgetUseCase(repository, auditLogService);
const getBudgetUseCase = new GetBudgetUseCase(repository);
const updateBudgetUseCase = new UpdateBudgetUseCase(repository, auditLogService);
const deleteBudgetUseCase = new DeleteBudgetUseCase(repository, auditLogService);
const applyCarryoverUseCase = new ApplyCarryoverUseCase(repository, transactionManager, auditLogService);
const getBudgetSummaryUseCase = new GetBudgetSummaryUseCase(repository);
const closeBudgetUseCase = new CloseBudgetUseCase(repository, transactionManager, auditLogService);

export const budgetsController = new BudgetsController(
    listBudgetsUseCase,
    getPendingCarryoverUseCase,
    createBudgetUseCase,
    getBudgetUseCase,
    updateBudgetUseCase,
    deleteBudgetUseCase,
    applyCarryoverUseCase,
    getBudgetSummaryUseCase,
    closeBudgetUseCase
);
