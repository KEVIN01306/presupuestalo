import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { CurrencySummary } from "../domain/currency.entity.js";
import type { CurrenciesRepository } from "../domain/currencies.repository.js";

export class ListCurrenciesUseCase {
    constructor(private readonly repository: CurrenciesRepository) {}

    async execute(): Promise<CurrencySummary[]> {
        try {
            return await this.repository.listActive();
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al obtener las monedas", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
