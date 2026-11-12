import prisma from "@infrastructure/config/prisma/prisma.config.js";
import { auditLogService } from "@modules/Audit/audit.module.js";
import { PrismaIncomeCategoriesRepository } from "./infrastructure/prisma-income-categories.repository.js";
import { ListIncomeCategoriesUseCase } from "./application/list-income-categories.usecase.js";
import { CreateIncomeCategoryUseCase } from "./application/create-income-category.usecase.js";
import { UpdateIncomeCategoryUseCase } from "./application/update-income-category.usecase.js";
import { DeleteIncomeCategoryUseCase } from "./application/delete-income-category.usecase.js";
import { IncomeCategoriesController } from "./presentation/income-categories.controller.js";

const repository = new PrismaIncomeCategoriesRepository(prisma);

const listIncomeCategoriesUseCase = new ListIncomeCategoriesUseCase(repository);
const createIncomeCategoryUseCase = new CreateIncomeCategoryUseCase(repository, auditLogService);
const updateIncomeCategoryUseCase = new UpdateIncomeCategoryUseCase(repository, auditLogService);
const deleteIncomeCategoryUseCase = new DeleteIncomeCategoryUseCase(repository, auditLogService);

export const incomeCategoriesController = new IncomeCategoriesController(
    listIncomeCategoriesUseCase,
    createIncomeCategoryUseCase,
    updateIncomeCategoryUseCase,
    deleteIncomeCategoryUseCase
);
