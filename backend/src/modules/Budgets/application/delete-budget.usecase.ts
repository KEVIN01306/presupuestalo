import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import { ForeignKeyConstraintError } from "@shared/db/database/errors/ForeignKeyConstraintError.js";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { BudgetsRepository } from "../domain/budgets.repository.js";

export class DeleteBudgetUseCase {
    constructor(
        private readonly repository: BudgetsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        budgetId: string,
        teamId: string,
        auditContext?: AuditContext
    ): Promise<void> {
        try {
            const existing = await this.repository.findById(budgetId, teamId);
            if (!existing) {
                throw new AppError("Presupuesto no encontrado", "DATA_NOT_FOUND", 404);
            }

            await this.repository.delete(budgetId, teamId);

            await this.auditLogService.record({
                action: "DELETE",
                resource: "budget",
                resourceId: budgetId,
                context: auditContext,
                before: {
                    id: existing.id,
                    name: existing.name,
                    startDate: existing.startDate,
                    endDate: existing.endDate,
                    status: existing.status,
                },
            });
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("Presupuesto no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (error instanceof ForeignKeyConstraintError) {
                throw new AppError(
                    "No se puede eliminar un presupuesto que tiene gastos registrados",
                    "BAD_REQUEST",
                    400
                );
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error al eliminar el presupuesto", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
