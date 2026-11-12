import { Decimal } from "decimal.js";
import type { PrismaClient } from "@prisma/client";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";
import type {
    Expense,
    ExpenseBudgetItemLimitContext,
    ExpenseCreateInput,
    ExpenseExistingContext,
    ExpenseListFilters,
    ExpenseUpdateInput,
} from "../domain/expense.entity.js";
import type { ExpensesRepository } from "../domain/expenses.repository.js";
import { ExpenseMapper } from "./mappers/expense.mapper.js";

const expenseInclude = {
    budgetItem: {
        select: {
            id: true,
            name: true,
        },
    },
    paidBy: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
        },
    },
    createdBy: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
        },
    },
};

export class PrismaExpensesRepository implements ExpensesRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async budgetExists(budgetId: string, teamId: string): Promise<boolean> {
        try {
            const budget = await this.prisma.budget.findFirst({
                where: { id: budgetId, teamId },
                select: { id: true },
            });
            return Boolean(budget);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listByBudget(budgetId: string, teamId: string, filters?: ExpenseListFilters): Promise<Expense[]> {
        try {
            const records = await this.prisma.expense.findMany({
                where: {
                    ...(filters?.budgetItemId ? { budgetItemId: filters.budgetItemId } : {}),
                    ...(filters?.paidByUserId ? { paidByUserId: filters.paidByUserId } : {}),
                    budgetItem: {
                        budgetId,
                        budget: { teamId },
                    },
                },
                orderBy: [{ date: "desc" }, { createdAt: "desc" }],
                include: expenseInclude,
            });

            return records.map((r) => ExpenseMapper.map(r));
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findBudgetStatus(budgetId: string, teamId: string): Promise<"ACTIVE" | "CLOSED" | null> {
        try {
            const budget = await this.prisma.budget.findFirst({
                where: { id: budgetId, teamId },
                select: { status: true },
            });
            return budget?.status ?? null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async userBelongsToTeam(userId: string, teamId: string): Promise<boolean> {
        try {
            const member = await this.prisma.teamMember.findUnique({
                where: {
                    teamId_userId: {
                        teamId,
                        userId,
                    },
                },
                select: { id: true },
            });
            return Boolean(member);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async getBudgetItemLimitContext(
        budgetItemId: string,
        budgetId: string,
        teamId: string,
        paidByUserId: string,
        excludeExpenseId?: string
    ): Promise<ExpenseBudgetItemLimitContext | null> {
        try {
            const item = await this.prisma.budgetItem.findFirst({
                where: {
                    id: budgetItemId,
                    budgetId,
                    budget: { teamId },
                },
                select: {
                    id: true,
                    budgetId: true,
                    projectedAmount: true,
                    hasUserSplit: true,
                    budget: {
                        select: {
                            status: true,
                        },
                    },
                    allocations: {
                        where: { userId: paidByUserId },
                        select: { assignedAmount: true },
                    },
                    expenses: {
                        where: excludeExpenseId ? { id: { not: excludeExpenseId } } : undefined,
                        select: {
                            amount: true,
                            paidByUserId: true,
                        },
                    },
                },
            });

            if (!item) return null;

            let totalSpentDec = new Decimal(0);
            let userSpentDec = new Decimal(0);
            for (const exp of item.expenses) {
                const amt = new Decimal(exp.amount.toString());
                totalSpentDec = totalSpentDec.plus(amt);
                if (exp.paidByUserId === paidByUserId) {
                    userSpentDec = userSpentDec.plus(amt);
                }
            }

            const allocation = item.allocations[0];

            return {
                id: item.id,
                budgetId: item.budgetId,
                budgetStatus: item.budget.status,
                projectedAmount: new Decimal(item.projectedAmount.toString()).toFixed(2),
                hasUserSplit: item.hasUserSplit,
                totalSpentExcluding: totalSpentDec.toFixed(2),
                userAllocationAmount: allocation
                    ? new Decimal(allocation.assignedAmount.toString()).toFixed(2)
                    : null,
                userSpentExcluding: userSpentDec.toFixed(2),
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByIdWithContext(expenseId: string, teamId: string): Promise<ExpenseExistingContext | null> {
        try {
            const record = await this.prisma.expense.findFirst({
                where: {
                    id: expenseId,
                    budgetItem: {
                        budget: { teamId },
                    },
                },
                include: {
                    ...expenseInclude,
                    budgetItem: {
                        select: {
                            id: true,
                            name: true,
                            budgetId: true,
                            budget: {
                                select: {
                                    status: true,
                                    teamId: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!record) return null;

            return {
                expense: ExpenseMapper.map(record),
                budgetId: record.budgetItem.budgetId,
                budgetStatus: record.budgetItem.budget.status,
                teamId: record.budgetItem.budget.teamId,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async create(
        data: Required<Pick<ExpenseCreateInput, "budgetItemId" | "paidByUserId" | "amount">> & {
            createdByUserId: string;
            date: Date;
            description: string | null;
        }
    ): Promise<Expense> {
        try {
            const amountStr = new Decimal(data.amount).toDecimalPlaces(2).toFixed(2);
            const created = await this.prisma.expense.create({
                data: {
                    budgetItemId: data.budgetItemId,
                    paidByUserId: data.paidByUserId,
                    createdByUserId: data.createdByUserId,
                    amount: amountStr,
                    date: data.date,
                    description: data.description,
                },
                include: expenseInclude,
            });

            return ExpenseMapper.map(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(expenseId: string, data: ExpenseUpdateInput): Promise<Expense> {
        try {
            const updated = await this.prisma.expense.update({
                where: { id: expenseId },
                data: {
                    ...(data.budgetItemId !== undefined ? { budgetItemId: data.budgetItemId } : {}),
                    ...(data.paidByUserId !== undefined ? { paidByUserId: data.paidByUserId } : {}),
                    ...(data.amount !== undefined
                        ? { amount: new Decimal(data.amount).toDecimalPlaces(2).toFixed(2) }
                        : {}),
                    ...(data.date !== undefined ? { date: data.date } : {}),
                    ...(data.description !== undefined ? { description: data.description } : {}),
                },
                include: expenseInclude,
            });

            return ExpenseMapper.map(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(expenseId: string): Promise<void> {
        try {
            const result = await this.prisma.expense.deleteMany({
                where: { id: expenseId },
            });
            if (result.count === 0) {
                throw new NotFoundPersistenceError();
            }
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }
}
