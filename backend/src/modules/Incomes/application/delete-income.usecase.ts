import { Decimal } from "decimal.js";
import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { IncomesRepository } from "../domain/incomes.repository.js";

export class DeleteIncomeUseCase {
    constructor(
        private readonly repository: IncomesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        incomeId: string,
        teamId: string,
        auditContext?: AuditContext
    ): Promise<void> {
        try {
            const context = await this.repository.findByIdWithContext(incomeId, teamId);
            if (!context) {
                throw new AppError("Ingreso no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (context.budgetStatus === "CLOSED") {
                throw new AppError(
                    "No se puede eliminar un ingreso de un presupuesto cerrado",
                    "BUDGET_CLOSED",
                    400
                );
            }

            const totals = await this.repository.getBudgetTotals(context.income.budgetId, teamId);
            const currentTotalIncome = new Decimal(totals.totalIncome);
            const totalProjected = new Decimal(totals.totalProjected);
            const incomeAmount = new Decimal(context.income.amount);
            const remainingTotalIncome = currentTotalIncome.minus(incomeAmount);

            if (remainingTotalIncome.lt(totalProjected)) {
                throw new AppError(
                    "No se puede eliminar este ingreso porque el total de ingresos quedaría por debajo de lo proyectado en los rubros del presupuesto",
                    "BUDGET_CEILING_VIOLATION",
                    400
                );
            }

            await this.repository.delete(incomeId);

            await this.auditLogService.record({
                action: "DELETE",
                resource: "income",
                resourceId: incomeId,
                context: auditContext,
                before: context.income,
            });
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("Ingreso no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error al eliminar el ingreso", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
