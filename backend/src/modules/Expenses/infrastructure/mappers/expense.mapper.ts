import { Decimal } from "decimal.js";
import type { BudgetItem, Expense as PrismaExpense, User } from "@prisma/client";
import type { Expense } from "../../domain/expense.entity.js";

type UserSummaryRecord = Pick<User, "id" | "firstName" | "lastName" | "email" | "avatarUrl">;

type ExpenseWithRelations = PrismaExpense & {
    budgetItem?: Pick<BudgetItem, "id" | "name"> | null;
    paidBy?: UserSummaryRecord | null;
    createdBy?: UserSummaryRecord | null;
};

export class ExpenseMapper {
    static map(record: ExpenseWithRelations): Expense {
        return {
            id: record.id,
            budgetItemId: record.budgetItemId,
            paidByUserId: record.paidByUserId,
            createdByUserId: record.createdByUserId,
            amount: new Decimal(record.amount.toString()).toDecimalPlaces(2).toNumber(),
            date: record.date,
            description: record.description,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            ...(record.budgetItem
                ? {
                      budgetItem: {
                          id: record.budgetItem.id,
                          name: record.budgetItem.name,
                      },
                  }
                : {}),
            ...(record.paidBy
                ? {
                      paidBy: {
                          id: record.paidBy.id,
                          firstName: record.paidBy.firstName,
                          lastName: record.paidBy.lastName,
                          email: record.paidBy.email,
                          avatarUrl: record.paidBy.avatarUrl,
                      },
                  }
                : {}),
            ...(record.createdBy
                ? {
                      createdBy: {
                          id: record.createdBy.id,
                          firstName: record.createdBy.firstName,
                          lastName: record.createdBy.lastName,
                          email: record.createdBy.email,
                          avatarUrl: record.createdBy.avatarUrl,
                      },
                  }
                : {}),
        };
    }
}
