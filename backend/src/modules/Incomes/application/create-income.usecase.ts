import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { Income, IncomeCreateInput } from "../domain/income.entity.js";
import type { IncomesRepository } from "../domain/incomes.repository.js";

export class CreateIncomeUseCase {
    constructor(
        private readonly repository: IncomesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        budgetId: string,
        teamId: string,
        data: IncomeCreateInput,
        auditContext?: AuditContext
    ): Promise<Income> {
        try {
            const budgetStatus = await this.repository.findBudgetStatus(budgetId, teamId);
            if (!budgetStatus) {
                throw new AppError("Presupuesto no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (budgetStatus === "CLOSED") {
                throw new AppError(
                    "No se pueden registrar ingresos en un presupuesto cerrado",
                    "BUDGET_CLOSED",
                    400
                );
            }

            const [categoryValid, memberValid] = await Promise.all([
                this.repository.categoryBelongsToTeam(data.categoryId, teamId),
                this.repository.userBelongsToTeam(data.userId, teamId),
            ]);

            if (!categoryValid) {
                throw new AppError(
                    "La categoría de ingreso no pertenece a este equipo",
                    "INVALID_CATEGORY",
                    400
                );
            }
            if (!memberValid) {
                throw new AppError(
                    "El usuario seleccionado no es miembro de este equipo",
                    "INVALID_TEAM_MEMBER",
                    400
                );
            }

            const created = await this.repository.create(budgetId, data);

            await this.auditLogService.record({
                action: "CREATE",
                resource: "income",
                resourceId: created.id,
                context: auditContext,
                after: created,
            });

            return created;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al registrar el ingreso", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
