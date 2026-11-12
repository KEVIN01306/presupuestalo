import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { BudgetSummary } from "../domain/budget.entity.js";
import type { BudgetsRepository } from "../domain/budgets.repository.js";

export class ListBudgetsUseCase {
    constructor(private readonly repository: BudgetsRepository) {}

    async execute(teamId: string): Promise<BudgetSummary[]> {
        try {
            return await this.repository.listByTeam(teamId);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al obtener los presupuestos del equipo", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
