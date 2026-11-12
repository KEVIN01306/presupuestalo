import type { PrismaClient } from "@prisma/client";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";
import type { Currency, CurrencySummary } from "../domain/currency.entity.js";
import type { CurrenciesRepository } from "../domain/currencies.repository.js";
import { CurrencyMapper } from "./mappers/currency.mapper.js";

export class PrismaCurrenciesRepository implements CurrenciesRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async listActive(): Promise<CurrencySummary[]> {
        try {
            const currencies = await this.prisma.currency.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    code: true,
                    name: true,
                    symbol: true,
                },
                orderBy: { code: "asc" },
            });

            return currencies.map((c) => CurrencyMapper.mapSummary(c));
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<Currency | null> {
        try {
            const currency = await this.prisma.currency.findUnique({
                where: { id },
            });
            return currency ? CurrencyMapper.map(currency) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByCode(code: string): Promise<Currency | null> {
        try {
            const currency = await this.prisma.currency.findUnique({
                where: { code },
            });
            return currency ? CurrencyMapper.map(currency) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
