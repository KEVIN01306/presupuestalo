import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { IncomeCategory } from "../domain/income-category.entity.js";
import type { IncomeCategoriesRepository } from "../domain/income-categories.repository.js";

export class ListIncomeCategoriesUseCase {
    constructor(private readonly repository: IncomeCategoriesRepository) {}

    async execute(teamId: string): Promise<IncomeCategory[]> {
        try {
            return await this.repository.listByTeam(teamId);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al obtener las categorías de ingreso", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
