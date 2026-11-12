import { Decimal } from "decimal.js";
import type {
    BudgetItem as PrismaBudgetItem,
    BudgetItemAllocation as PrismaBudgetItemAllocation,
    User,
} from "@prisma/client";
import type { BudgetItem, BudgetItemAllocation } from "../../domain/budget-item.entity.js";

type AllocationWithUser = PrismaBudgetItemAllocation & {
    user?: Pick<User, "id" | "firstName" | "lastName" | "email" | "avatarUrl"> | null;
};

type BudgetItemWithRelations = PrismaBudgetItem & {
    allocations?: AllocationWithUser[];
    expenses?: Array<{ amount: { toString(): string } }>;
};

export class BudgetItemMapper {
    static mapAllocation(record: AllocationWithUser): BudgetItemAllocation {
        return {
            id: record.id,
            budgetItemId: record.budgetItemId,
            userId: record.userId,
            assignedAmount: new Decimal(record.assignedAmount.toString()).toDecimalPlaces(2).toNumber(),
            ...(record.user
                ? {
                      user: {
                          id: record.user.id,
                          firstName: record.user.firstName,
                          lastName: record.user.lastName,
                          email: record.user.email,
                          avatarUrl: record.user.avatarUrl,
                      },
                  }
                : {}),
        };
    }

    static map(record: BudgetItemWithRelations): BudgetItem {
        const projectedDec = new Decimal(record.projectedAmount.toString());
        const totalSpentDec = (record.expenses ?? []).reduce(
            (acc, exp) => acc.plus(new Decimal(exp.amount.toString())),
            new Decimal(0)
        );
        const remainingDec = projectedDec.minus(totalSpentDec);

        return {
            id: record.id,
            budgetId: record.budgetId,
            name: record.name,
            projectedAmount: projectedDec.toDecimalPlaces(2).toNumber(),
            hasUserSplit: record.hasUserSplit,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            totalSpent: totalSpentDec.toDecimalPlaces(2).toNumber(),
            remainingAmount: remainingDec.toDecimalPlaces(2).toNumber(),
            allocations: (record.allocations ?? []).map((a) => BudgetItemMapper.mapAllocation(a)),
        };
    }
}
