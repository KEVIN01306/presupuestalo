import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { BudgetDashboardSummary } from "../domain/budget.entity.js";
import type { BudgetsRepository } from "../domain/budgets.repository.js";

export class GetBudgetSummaryUseCase {
    constructor(private readonly repository: BudgetsRepository) {}

    async execute(
        budgetId: string,
        teamId: string,
        currentUserId: string
    ): Promise<BudgetDashboardSummary> {
        try {
            const summary = await this.repository.getDashboardSummary(budgetId, teamId, currentUserId);
            if (!summary) {
                throw new AppError("Presupuesto no encontrado", "DATA_NOT_FOUND", 404);
            }
            return summary;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al obtener el resumen del presupuesto", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
