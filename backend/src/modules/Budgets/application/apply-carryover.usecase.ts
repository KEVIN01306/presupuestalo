import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import type { TransactionManager } from "@shared/db/database/TransactionManager.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { ApplyCarryoverResult } from "../domain/budget.entity.js";
import type { BudgetsRepository } from "../domain/budgets.repository.js";

export class ApplyCarryoverUseCase {
    constructor(
        private readonly repository: BudgetsRepository,
        private readonly transactionManager: TransactionManager,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        budgetId: string,
        teamId: string,
        auditContext?: AuditContext
    ): Promise<ApplyCarryoverResult> {
        try {
            const result = await this.transactionManager.run(async (tx) => {
                return await this.repository.applyCarryover(budgetId, teamId, tx);
            });

            await this.auditLogService.record({
                action: "CREATE",
                resource: "income_carryover",
                resourceId: result.targetBudgetId,
                context: auditContext,
                after: {
                    closingId: result.closingId,
                    sourceBudgetId: result.sourceBudgetId,
                    targetBudgetId: result.targetBudgetId,
                    carriedOverAmount: result.carriedOverAmount,
                    incomesCount: result.createdIncomes.length,
                },
            });

            return result;
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("Presupuesto no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error al aplicar el sobrante al presupuesto", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
