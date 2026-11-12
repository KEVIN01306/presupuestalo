import prisma from "@infrastructure/config/prisma/prisma.config.js";
import { auditLogService } from "@modules/Audit/audit.module.js";
import { PrismaExpensesRepository } from "./infrastructure/prisma-expenses.repository.js";
import { ListExpensesUseCase } from "./application/list-expenses.usecase.js";
import { CreateExpenseUseCase } from "./application/create-expense.usecase.js";
import { UpdateExpenseUseCase } from "./application/update-expense.usecase.js";
import { DeleteExpenseUseCase } from "./application/delete-expense.usecase.js";
import { ExpensesController } from "./presentation/expenses.controller.js";

const repository = new PrismaExpensesRepository(prisma);

const listExpensesUseCase = new ListExpensesUseCase(repository);
const createExpenseUseCase = new CreateExpenseUseCase(repository, auditLogService);
const updateExpenseUseCase = new UpdateExpenseUseCase(repository, auditLogService);
const deleteExpenseUseCase = new DeleteExpenseUseCase(repository, auditLogService);

export const expensesController = new ExpensesController(
    listExpensesUseCase,
    createExpenseUseCase,
    updateExpenseUseCase,
    deleteExpenseUseCase
);
