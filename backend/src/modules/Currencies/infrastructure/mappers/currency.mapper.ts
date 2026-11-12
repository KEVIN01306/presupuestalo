import type { Currency as PrismaCurrency } from "@prisma/client";
import type { Currency, CurrencySummary } from "../../domain/currency.entity.js";

export class CurrencyMapper {
    static map(record: PrismaCurrency): Currency {
        return {
            id: record.id,
            code: record.code,
            name: record.name,
            symbol: record.symbol,
            isActive: record.isActive,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        };
    }

    static mapSummary(record: Pick<PrismaCurrency, "id" | "code" | "name" | "symbol">): CurrencySummary {
        return {
            id: record.id,
            code: record.code,
            name: record.name,
            symbol: record.symbol,
        };
    }
}
