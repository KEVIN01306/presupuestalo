import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { BudgetDetail } from "../domain/budget.entity.js";
import type { BudgetsRepository } from "../domain/budgets.repository.js";

export class GetBudgetUseCase {
    constructor(private readonly repository: BudgetsRepository) {}

    async execute(budgetId: string, teamId: string): Promise<BudgetDetail> {
        try {
            const budget = await this.repository.findById(budgetId, teamId);
            if (!budget) {
                throw new AppError("Presupuesto no encontrado", "DATA_NOT_FOUND", 404);
            }
            return budget;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al obtener el presupuesto", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
