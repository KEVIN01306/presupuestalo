import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { Budget, BudgetCreateInput } from "../domain/budget.entity.js";
import type { BudgetsRepository } from "../domain/budgets.repository.js";

export class CreateBudgetUseCase {
    constructor(
        private readonly repository: BudgetsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        teamId: string,
        data: BudgetCreateInput,
        auditContext?: AuditContext
    ): Promise<Budget> {
        try {
            if (data.endDate < data.startDate) {
                throw new AppError(
                    "La fecha de fin debe ser igual o posterior a la fecha de inicio",
                    "INVALID_DATA",
                    400
                );
            }

            const created = await this.repository.create(teamId, data);

            await this.auditLogService.record({
                action: "CREATE",
                resource: "budget",
                resourceId: created.id,
                context: auditContext,
                after: created,
            });

            return created;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al crear el presupuesto", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
