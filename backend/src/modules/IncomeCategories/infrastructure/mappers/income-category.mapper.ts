import type { IncomeCategory as PrismaIncomeCategory } from "@prisma/client";
import type { IncomeCategory } from "../../domain/income-category.entity.js";

export class IncomeCategoryMapper {
    static map(record: PrismaIncomeCategory): IncomeCategory {
        return {
            id: record.id,
            teamId: record.teamId,
            name: record.name,
            isSystem: record.isSystem,
            createdAt: record.createdAt,
        };
    }
}
