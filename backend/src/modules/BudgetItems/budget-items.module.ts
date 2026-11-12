import prisma from "@infrastructure/config/prisma/prisma.config.js";
import { auditLogService } from "@modules/Audit/audit.module.js";
import { PrismaBudgetItemsRepository } from "./infrastructure/prisma-budget-items.repository.js";
import { ListBudgetItemsUseCase } from "./application/list-budget-items.usecase.js";
import { CreateBudgetItemUseCase } from "./application/create-budget-item.usecase.js";
import { UpdateBudgetItemUseCase } from "./application/update-budget-item.usecase.js";
import { DeleteBudgetItemUseCase } from "./application/delete-budget-item.usecase.js";
import { BudgetItemsController } from "./presentation/budget-items.controller.js";

const repository = new PrismaBudgetItemsRepository(prisma);

const listBudgetItemsUseCase = new ListBudgetItemsUseCase(repository);
const createBudgetItemUseCase = new CreateBudgetItemUseCase(repository, auditLogService);
const updateBudgetItemUseCase = new UpdateBudgetItemUseCase(repository, auditLogService);
const deleteBudgetItemUseCase = new DeleteBudgetItemUseCase(repository, auditLogService);

export const budgetItemsController = new BudgetItemsController(
    listBudgetItemsUseCase,
    createBudgetItemUseCase,
    updateBudgetItemUseCase,
    deleteBudgetItemUseCase
);
