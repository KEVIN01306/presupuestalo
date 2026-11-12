import prisma from "@infrastructure/config/prisma/prisma.config.js";
import { auditLogService } from "@modules/Audit/audit.module.js";
import { PrismaIncomesRepository } from "./infrastructure/prisma-incomes.repository.js";
import { ListIncomesUseCase } from "./application/list-incomes.usecase.js";
import { CreateIncomeUseCase } from "./application/create-income.usecase.js";
import { UpdateIncomeUseCase } from "./application/update-income.usecase.js";
import { DeleteIncomeUseCase } from "./application/delete-income.usecase.js";
import { IncomesController } from "./presentation/incomes.controller.js";

const repository = new PrismaIncomesRepository(prisma);

const listIncomesUseCase = new ListIncomesUseCase(repository);
const createIncomeUseCase = new CreateIncomeUseCase(repository, auditLogService);
const updateIncomeUseCase = new UpdateIncomeUseCase(repository, auditLogService);
const deleteIncomeUseCase = new DeleteIncomeUseCase(repository, auditLogService);

export const incomesController = new IncomesController(
    listIncomesUseCase,
    createIncomeUseCase,
    updateIncomeUseCase,
    deleteIncomeUseCase
);
