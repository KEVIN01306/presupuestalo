import type { Currency, CurrencySummary } from "./currency.entity.js";

export interface CurrenciesRepository {
    listActive(): Promise<CurrencySummary[]>;
    findById(id: string): Promise<Currency | null>;
    findByCode(code: string): Promise<Currency | null>;
}
