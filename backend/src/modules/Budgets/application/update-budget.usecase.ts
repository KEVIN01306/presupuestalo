import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { Budget, BudgetUpdateInput } from "../domain/budget.entity.js";
import type { BudgetsRepository } from "../domain/budgets.repository.js";

export class UpdateBudgetUseCase {
    constructor(
        private readonly repository: BudgetsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        budgetId: string,
        teamId: string,
        data: BudgetUpdateInput,
        auditContext?: AuditContext
    ): Promise<Budget> {
        try {
            const existing = await this.repository.findById(budgetId, teamId);
            if (!existing) {
                throw new AppError("Presupuesto no encontrado", "DATA_NOT_FOUND", 404);
            }

            if (existing.status === "CLOSED") {
                throw new AppError(
                    "No se puede modificar un presupuesto cerrado",
                    "BUDGET_CLOSED",
                    400
                );
            }

            const effectiveStart = data.startDate ?? existing.startDate;
            const effectiveEnd = data.endDate ?? existing.endDate;
            if (effectiveEnd < effectiveStart) {
                throw new AppError(
                    "La fecha de fin debe ser igual o posterior a la fecha de inicio",
                    "INVALID_DATA",
                    400
                );
            }

            const updated = await this.repository.update(budgetId, teamId, data);

            await this.auditLogService.record({
                action: "UPDATE",
                resource: "budget",
                resourceId: updated.id,
                context: auditContext,
                before: {
                    name: existing.name,
                    startDate: existing.startDate,
                    endDate: existing.endDate,
                    status: existing.status,
                },
                after: updated,
            });

            return updated;
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("Presupuesto no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error al actualizar el presupuesto", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
