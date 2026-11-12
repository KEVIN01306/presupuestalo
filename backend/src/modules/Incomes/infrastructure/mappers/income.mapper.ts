import { Decimal } from "decimal.js";
import type { Income as PrismaIncome } from "@prisma/client";
import type {
    Income,
    IncomeCategorySummary,
    IncomeUserSummary,
} from "../../domain/income.entity.js";

type IncomeWithRelations = PrismaIncome & {
    category?: IncomeCategorySummary;
    user?: IncomeUserSummary;
};

export class IncomeMapper {
    static map(record: IncomeWithRelations): Income {
        return {
            id: record.id,
            budgetId: record.budgetId,
            categoryId: record.categoryId,
            userId: record.userId,
            amount: new Decimal(record.amount.toString()).toDecimalPlaces(2).toNumber(),
            description: record.description,
            isCarryover: record.isCarryover,
            date: record.date,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            ...(record.category ? { category: record.category } : {}),
            ...(record.user ? { user: record.user } : {}),
        };
    }
}
