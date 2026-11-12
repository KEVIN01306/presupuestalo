import { Decimal } from "decimal.js";
import type { PrismaClient } from "@prisma/client";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";
import type {
    BudgetCeilingContext,
    BudgetItem,
    BudgetItemCreateInput,
    BudgetItemDeleteContext,
    BudgetItemUpdateContext,
    BudgetItemUpdateInput,
} from "../domain/budget-item.entity.js";
import type { BudgetItemsRepository } from "../domain/budget-items.repository.js";
import { BudgetItemMapper } from "./mappers/budget-item.mapper.js";

const itemInclude = {
    allocations: {
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    avatarUrl: true,
                },
            },
        },
        orderBy: {
            user: {
                firstName: "asc" as const,
            },
        },
    },
    expenses: {
        select: {
            amount: true,
        },
    },
};

export class PrismaBudgetItemsRepository implements BudgetItemsRepository {
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

    async listByBudget(budgetId: string, teamId: string): Promise<BudgetItem[]> {
        try {
            const records = await this.prisma.budgetItem.findMany({
                where: {
                    budgetId,
                    budget: { teamId },
                },
                orderBy: [{ createdAt: "asc" }],
                include: itemInclude,
            });

            return records.map((r) => BudgetItemMapper.map(r));
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async getBudgetCeilingContext(budgetId: string, teamId: string): Promise<BudgetCeilingContext | null> {
        try {
            const budget = await this.prisma.budget.findFirst({
                where: { id: budgetId, teamId },
                select: {
                    id: true,
                    status: true,
                    incomes: { select: { amount: true } },
                    items: { select: { projectedAmount: true } },
                },
            });

            if (!budget) return null;

            const totalIncome = budget.incomes.reduce(
                (acc, inc) => acc.plus(new Decimal(inc.amount.toString())),
                new Decimal(0)
            );
            const existingProjectedSum = budget.items.reduce(
                (acc, item) => acc.plus(new Decimal(item.projectedAmount.toString())),
                new Decimal(0)
            );

            return {
                budgetId: budget.id,
                status: budget.status,
                totalIncome: totalIncome.toFixed(2),
                existingProjectedSum: existingProjectedSum.toFixed(2),
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByIdForUpdate(itemId: string, teamId: string): Promise<BudgetItemUpdateContext | null> {
        try {
            const record = await this.prisma.budgetItem.findFirst({
                where: {
                    id: itemId,
                    budget: { teamId },
                },
                include: {
                    ...itemInclude,
                    expenses: {
                        select: {
                            amount: true,
                            paidByUserId: true,
                        },
                    },
                    budget: {
                        select: {
                            id: true,
                            status: true,
                            teamId: true,
                            incomes: { select: { amount: true } },
                            items: { select: { projectedAmount: true } },
                        },
                    },
                },
            });

            if (!record) return null;

            const totalIncome = record.budget.incomes.reduce(
                (acc, inc) => acc.plus(new Decimal(inc.amount.toString())),
                new Decimal(0)
            );
            const existingProjectedSum = record.budget.items.reduce(
                (acc, item) => acc.plus(new Decimal(item.projectedAmount.toString())),
                new Decimal(0)
            );

            const spentByUserMap = new Map<string, Decimal>();
            let totalSpentDec = new Decimal(0);
            for (const exp of record.expenses) {
                const amt = new Decimal(exp.amount.toString());
                totalSpentDec = totalSpentDec.plus(amt);
                const prev = spentByUserMap.get(exp.paidByUserId) ?? new Decimal(0);
                spentByUserMap.set(exp.paidByUserId, prev.plus(amt));
            }

            const spentByUser: Record<string, string> = {};
            for (const [userId, dec] of spentByUserMap.entries()) {
                spentByUser[userId] = dec.toFixed(2);
            }

            return {
                item: BudgetItemMapper.map(record),
                budgetStatus: record.budget.status,
                teamId: record.budget.teamId,
                totalIncome: totalIncome.toFixed(2),
                existingProjectedSum: existingProjectedSum.toFixed(2),
                totalSpentOnItem: totalSpentDec.toFixed(2),
                spentByUser,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByIdForDelete(itemId: string, teamId: string): Promise<BudgetItemDeleteContext | null> {
        try {
            const record = await this.prisma.budgetItem.findFirst({
                where: {
                    id: itemId,
                    budget: { teamId },
                },
                include: {
                    ...itemInclude,
                    budget: {
                        select: {
                            status: true,
                            teamId: true,
                        },
                    },
                    _count: {
                        select: {
                            expenses: true,
                        },
                    },
                },
            });

            if (!record) return null;

            return {
                item: BudgetItemMapper.map(record),
                budgetStatus: record.budget.status,
                teamId: record.budget.teamId,
                expensesCount: record._count.expenses,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async areUsersTeamMembers(userIds: string[], teamId: string): Promise<boolean> {
        try {
            if (userIds.length === 0) return true;
            const uniqueIds = [...new Set(userIds)];
            const count = await this.prisma.teamMember.count({
                where: {
                    teamId,
                    userId: { in: uniqueIds },
                },
            });
            return count === uniqueIds.length;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async create(budgetId: string, data: BudgetItemCreateInput): Promise<BudgetItem> {
        try {
            const projectedStr = new Decimal(data.projectedAmount).toDecimalPlaces(2).toFixed(2);
            const allocationsData =
                data.hasUserSplit && data.allocations && data.allocations.length > 0
                    ? data.allocations.map((a) => ({
                          userId: a.userId,
                          assignedAmount: new Decimal(a.assignedAmount).toDecimalPlaces(2).toFixed(2),
                      }))
                    : [];

            const created = await this.prisma.$transaction(async (tx) => {
                const item = await tx.budgetItem.create({
                    data: {
                        budgetId,
                        name: data.name,
                        projectedAmount: projectedStr,
                        hasUserSplit: data.hasUserSplit,
                        ...(allocationsData.length > 0
                            ? {
                                  allocations: {
                                      create: allocationsData,
                                  },
                              }
                            : {}),
                    },
                    include: itemInclude,
                });

                return item;
            });

            return BudgetItemMapper.map(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(itemId: string, data: BudgetItemUpdateInput, replaceAllocations: boolean): Promise<BudgetItem> {
        try {
            const updated = await this.prisma.$transaction(async (tx) => {
                if (replaceAllocations) {
                    await tx.budgetItemAllocation.deleteMany({
                        where: { budgetItemId: itemId },
                    });

                    if (data.hasUserSplit !== false && data.allocations && data.allocations.length > 0) {
                        await tx.budgetItemAllocation.createMany({
                            data: data.allocations.map((a) => ({
                                budgetItemId: itemId,
                                userId: a.userId,
                                assignedAmount: new Decimal(a.assignedAmount).toDecimalPlaces(2).toFixed(2),
                            })),
                        });
                    }
                }

                return tx.budgetItem.update({
                    where: { id: itemId },
                    data: {
                        ...(data.name !== undefined ? { name: data.name } : {}),
                        ...(data.projectedAmount !== undefined
                            ? { projectedAmount: new Decimal(data.projectedAmount).toDecimalPlaces(2).toFixed(2) }
                            : {}),
                        ...(data.hasUserSplit !== undefined ? { hasUserSplit: data.hasUserSplit } : {}),
                    },
                    include: itemInclude,
                });
            });

            return BudgetItemMapper.map(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(itemId: string): Promise<void> {
        try {
            const result = await this.prisma.budgetItem.deleteMany({
                where: { id: itemId },
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
