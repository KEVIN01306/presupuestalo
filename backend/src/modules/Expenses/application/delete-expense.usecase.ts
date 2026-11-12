import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { ExpensesRepository } from "../domain/expenses.repository.js";

export class DeleteExpenseUseCase {
    constructor(
        private readonly repository: ExpensesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(expenseId: string, teamId: string, auditContext?: AuditContext): Promise<void> {
        try {
            const existingContext = await this.repository.findByIdWithContext(expenseId, teamId);
            if (!existingContext) {
                throw new AppError("Gasto no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (existingContext.budgetStatus === "CLOSED") {
                throw new AppError(
                    "No se pueden eliminar gastos en un presupuesto cerrado",
                    "BUDGET_CLOSED",
                    400
                );
            }

            await this.repository.delete(expenseId);

            await this.auditLogService.record({
                action: "DELETE",
                resource: "expense",
                resourceId: expenseId,
                context: auditContext,
                before: existingContext.expense,
            });
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("Gasto no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error al eliminar el gasto", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
