import { Decimal } from "decimal.js";
import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { Income, IncomeUpdateInput } from "../domain/income.entity.js";
import type { IncomesRepository } from "../domain/incomes.repository.js";

export class UpdateIncomeUseCase {
    constructor(
        private readonly repository: IncomesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        incomeId: string,
        teamId: string,
        data: IncomeUpdateInput,
        auditContext?: AuditContext
    ): Promise<Income> {
        try {
            const context = await this.repository.findByIdWithContext(incomeId, teamId);
            if (!context) {
                throw new AppError("Ingreso no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (context.budgetStatus === "CLOSED") {
                throw new AppError(
                    "No se puede modificar un ingreso de un presupuesto cerrado",
                    "BUDGET_CLOSED",
                    400
                );
            }

            if (data.categoryId !== undefined) {
                const categoryValid = await this.repository.categoryBelongsToTeam(data.categoryId, teamId);
                if (!categoryValid) {
                    throw new AppError(
                        "La categoría de ingreso no pertenece a este equipo",
                        "INVALID_CATEGORY",
                        400
                    );
                }
            }

            if (data.userId !== undefined) {
                const memberValid = await this.repository.userBelongsToTeam(data.userId, teamId);
                if (!memberValid) {
                    throw new AppError(
                        "El usuario seleccionado no es miembro de este equipo",
                        "INVALID_TEAM_MEMBER",
                        400
                    );
                }
            }

            if (data.amount !== undefined) {
                const totals = await this.repository.getBudgetTotals(context.income.budgetId, teamId);
                const currentTotalIncome = new Decimal(totals.totalIncome);
                const totalProjected = new Decimal(totals.totalProjected);
                const oldAmount = new Decimal(context.income.amount);
                const newAmount = new Decimal(data.amount).toDecimalPlaces(2);
                const newTotalIncome = currentTotalIncome.minus(oldAmount).plus(newAmount);

                if (newTotalIncome.lt(totalProjected)) {
                    throw new AppError(
                        "El nuevo monto reduciría el total de ingresos por debajo de lo proyectado en los rubros del presupuesto",
                        "BUDGET_CEILING_VIOLATION",
                        400
                    );
                }
            }

            const updated = await this.repository.update(incomeId, data);

            await this.auditLogService.record({
                action: "UPDATE",
                resource: "income",
                resourceId: updated.id,
                context: auditContext,
                before: context.income,
                after: updated,
            });

            return updated;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al actualizar el ingreso", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
