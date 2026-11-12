import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { Expense, ExpenseListFilters } from "../domain/expense.entity.js";
import type { ExpensesRepository } from "../domain/expenses.repository.js";

export class ListExpensesUseCase {
    constructor(private readonly repository: ExpensesRepository) {}

    async execute(
        budgetId: string,
        teamId: string,
        filters?: ExpenseListFilters
    ): Promise<Expense[]> {
        try {
            const exists = await this.repository.budgetExists(budgetId, teamId);
            if (!exists) {
                throw new AppError("Presupuesto no encontrado", "DATA_NOT_FOUND", 404);
            }

            return await this.repository.listByBudget(budgetId, teamId, filters);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al obtener los gastos del presupuesto", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
