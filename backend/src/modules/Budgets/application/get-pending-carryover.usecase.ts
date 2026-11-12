import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { PendingCarryoverResponse } from "../domain/budget.entity.js";
import type { BudgetsRepository } from "../domain/budgets.repository.js";

export class GetPendingCarryoverUseCase {
    constructor(private readonly repository: BudgetsRepository) {}

    async execute(teamId: string): Promise<PendingCarryoverResponse> {
        try {
            return await this.repository.getPendingCarryover(teamId);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al verificar sobrantes pendientes", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
