import { Decimal } from "decimal.js";
import type { PrismaClient } from "@prisma/client";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";
import type {
    Income,
    IncomeBudgetContext,
    IncomeCreateInput,
    IncomeListResponse,
    IncomeUpdateInput,
} from "../domain/income.entity.js";
import type { IncomesRepository } from "../domain/incomes.repository.js";
import { IncomeMapper } from "./mappers/income.mapper.js";

export class PrismaIncomesRepository implements IncomesRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async listByBudget(budgetId: string, teamId: string): Promise<IncomeListResponse> {
        try {
            const records = await this.prisma.income.findMany({
                where: {
                    budgetId,
                    budget: { teamId },
                },
                orderBy: [{ date: "desc" }, { createdAt: "desc" }],
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            isSystem: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });

            const totalIncomeDec = records.reduce(
                (acc, inc) => acc.plus(new Decimal(inc.amount.toString())),
                new Decimal(0)
            );

            return {
                incomes: records.map((r) => IncomeMapper.map(r)),
                totalIncome: totalIncomeDec.toDecimalPlaces(2).toNumber(),
            };
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

    async findByIdWithContext(incomeId: string, teamId: string): Promise<IncomeBudgetContext | null> {
        try {
            const record = await this.prisma.income.findFirst({
                where: {
                    id: incomeId,
                    budget: { teamId },
                },
                include: {
                    budget: {
                        select: {
                            status: true,
                            teamId: true,
                        },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                            isSystem: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });

            if (!record) return null;

            return {
                income: IncomeMapper.map(record),
                budgetStatus: record.budget.status,
                teamId: record.budget.teamId,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async categoryBelongsToTeam(categoryId: string, teamId: string): Promise<boolean> {
        try {
            const category = await this.prisma.incomeCategory.findFirst({
                where: { id: categoryId, teamId },
                select: { id: true },
            });
            return Boolean(category);
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

    async getBudgetTotals(
        budgetId: string,
        teamId: string
    ): Promise<{ totalIncome: string; totalProjected: string }> {
        try {
            const [incomes, items] = await Promise.all([
                this.prisma.income.findMany({
                    where: { budgetId, budget: { teamId } },
                    select: { amount: true },
                }),
                this.prisma.budgetItem.findMany({
                    where: { budgetId, budget: { teamId } },
                    select: { projectedAmount: true },
                }),
            ]);

            const totalIncome = incomes.reduce(
                (acc, inc) => acc.plus(new Decimal(inc.amount.toString())),
                new Decimal(0)
            );
            const totalProjected = items.reduce(
                (acc, item) => acc.plus(new Decimal(item.projectedAmount.toString())),
                new Decimal(0)
            );

            return {
                totalIncome: totalIncome.toFixed(2),
                totalProjected: totalProjected.toFixed(2),
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async create(budgetId: string, data: IncomeCreateInput): Promise<Income> {
        try {
            const amountStr = new Decimal(data.amount).toDecimalPlaces(2).toFixed(2);
            const created = await this.prisma.income.create({
                data: {
                    budgetId,
                    categoryId: data.categoryId,
                    userId: data.userId,
                    amount: amountStr,
                    description: data.description ?? null,
                    isCarryover: false,
                    date: data.date ?? new Date(),
                },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            isSystem: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });

            return IncomeMapper.map(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(incomeId: string, data: IncomeUpdateInput): Promise<Income> {
        try {
            const updated = await this.prisma.income.update({
                where: { id: incomeId },
                data: {
                    ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
                    ...(data.userId !== undefined ? { userId: data.userId } : {}),
                    ...(data.amount !== undefined
                        ? { amount: new Decimal(data.amount).toDecimalPlaces(2).toFixed(2) }
                        : {}),
                    ...(data.description !== undefined ? { description: data.description } : {}),
                    ...(data.date !== undefined ? { date: data.date } : {}),
                },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            isSystem: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });

            return IncomeMapper.map(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(incomeId: string): Promise<void> {
        try {
            const result = await this.prisma.income.deleteMany({
                where: { id: incomeId },
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
