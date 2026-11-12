import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import type { TransactionManager } from "@shared/db/database/TransactionManager.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { BudgetClosingDetail, CloseBudgetInput } from "../domain/budget.entity.js";
import type { BudgetsRepository } from "../domain/budgets.repository.js";

export class CloseBudgetUseCase {
    constructor(
        private readonly repository: BudgetsRepository,
        private readonly transactionManager: TransactionManager,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        budgetId: string,
        teamId: string,
        input: CloseBudgetInput,
        auditContext?: AuditContext
    ): Promise<BudgetClosingDetail> {
        try {
            const closing = await this.transactionManager.run(async (tx) => {
                return await this.repository.closeBudget(budgetId, teamId, input.savedAmount, tx);
            });

            await this.auditLogService.record({
                action: "UPDATE",
                resource: "budget",
                resourceId: budgetId,
                context: auditContext,
                after: {
                    status: "CLOSED",
                    closingId: closing.id,
                    totalIncome: closing.totalIncome,
                    totalSpent: closing.totalSpent,
                    totalRemainder: closing.totalRemainder,
                    savedAmount: closing.savedAmount,
                    carriedOverAmount: closing.carriedOverAmount,
                },
            });

            return closing;
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("Presupuesto no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error al cerrar el presupuesto", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
