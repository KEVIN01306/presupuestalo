import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { BudgetItem } from "../domain/budget-item.entity.js";
import type { BudgetItemsRepository } from "../domain/budget-items.repository.js";

export class ListBudgetItemsUseCase {
    constructor(private readonly repository: BudgetItemsRepository) {}

    async execute(budgetId: string, teamId: string): Promise<BudgetItem[]> {
        try {
            const exists = await this.repository.budgetExists(budgetId, teamId);
            if (!exists) {
                throw new AppError("Presupuesto no encontrado", "DATA_NOT_FOUND", 404);
            }

            return await this.repository.listByBudget(budgetId, teamId);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al obtener los rubros del presupuesto", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
