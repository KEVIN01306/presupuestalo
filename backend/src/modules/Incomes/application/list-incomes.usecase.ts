import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { IncomeListResponse } from "../domain/income.entity.js";
import type { IncomesRepository } from "../domain/incomes.repository.js";

export class ListIncomesUseCase {
    constructor(private readonly repository: IncomesRepository) {}

    async execute(budgetId: string, teamId: string): Promise<IncomeListResponse> {
        try {
            const budgetStatus = await this.repository.findBudgetStatus(budgetId, teamId);
            if (!budgetStatus) {
                throw new AppError("Presupuesto no encontrado", "DATA_NOT_FOUND", 404);
            }
            return await this.repository.listByBudget(budgetId, teamId);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al obtener los ingresos del presupuesto", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
