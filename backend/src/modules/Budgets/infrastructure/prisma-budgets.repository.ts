import { Decimal } from "decimal.js";
import type { Prisma, PrismaClient } from "@prisma/client";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";
import AppError from "@shared/errors/AppError.js";
import type {
    AppliedCarryoverIncome,
    ApplyCarryoverResult,
    Budget,
    BudgetClosingDetail,
    BudgetCreateInput,
    BudgetDashboardSummary,
    BudgetDetail,
    BudgetSummary,
    BudgetUpdateInput,
    PendingCarryoverResponse,
} from "../domain/budget.entity.js";
import type { BudgetsRepository } from "../domain/budgets.repository.js";
import { BudgetMapper } from "./mappers/budget.mapper.js";

export class PrismaBudgetsRepository implements BudgetsRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async listByTeam(teamId: string): Promise<BudgetSummary[]> {
        try {
            const records = await this.prisma.budget.findMany({
                where: { teamId },
                orderBy: { startDate: "desc" },
                include: {
                    incomes: {
                        select: { amount: true },
                    },
                    items: {
                        select: {
                            projectedAmount: true,
                            expenses: {
                                select: { amount: true },
                            },
                        },
                    },
                },
            });

            return records.map((record) => BudgetMapper.mapSummary(record));
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(budgetId: string, teamId: string): Promise<BudgetDetail | null> {
        try {
            const record = await this.prisma.budget.findFirst({
                where: { id: budgetId, teamId },
                include: {
                    incomes: {
                        select: { amount: true },
                    },
                    items: {
                        select: {
                            projectedAmount: true,
                            expenses: {
                                select: { amount: true },
                            },
                        },
                    },
                    closing: true,
                },
            });

            return record ? BudgetMapper.mapDetail(record) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async getDashboardSummary(
        budgetId: string,
        teamId: string,
        currentUserId: string
    ): Promise<BudgetDashboardSummary | null> {
        try {
            const [record, teamMembers] = await Promise.all([
                this.prisma.budget.findFirst({
                    where: { id: budgetId, teamId },
                    include: {
                        incomes: {
                            select: {
                                userId: true,
                                amount: true,
                            },
                        },
                        items: {
                            orderBy: { createdAt: "asc" },
                            select: {
                                id: true,
                                name: true,
                                projectedAmount: true,
                                hasUserSplit: true,
                                allocations: {
                                    select: {
                                        userId: true,
                                        assignedAmount: true,
                                        user: {
                                            select: {
                                                id: true,
                                                firstName: true,
                                                lastName: true,
                                            },
                                        },
                                    },
                                },
                                expenses: {
                                    select: {
                                        paidByUserId: true,
                                        amount: true,
                                        date: true,
                                    },
                                },
                            },
                        },
                        closing: {
                            include: {
                                userRemainders: {
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                firstName: true,
                                                lastName: true,
                                                email: true,
                                            },
                                        },
                                    },
                                    orderBy: { remainderAmount: "desc" },
                                },
                            },
                        },
                    },
                }),
                this.prisma.teamMember.findMany({
                    where: { teamId },
                    orderBy: { joinedAt: "asc" },
                    select: {
                        userId: true,
                        role: true,
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
                }),
            ]);

            if (!record) return null;

            return BudgetMapper.mapDashboardSummary(record, teamMembers, currentUserId);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async closeBudget(
        budgetId: string,
        teamId: string,
        savedAmount: number,
        tx?: unknown
    ): Promise<BudgetClosingDetail> {
        const client = (tx as Prisma.TransactionClient) ?? this.prisma;

        try {
            const budget = await client.budget.findFirst({
                where: { id: budgetId, teamId },
                include: {
                    incomes: {
                        select: {
                            userId: true,
                            amount: true,
                        },
                    },
                    items: {
                        select: {
                            expenses: {
                                select: {
                                    paidByUserId: true,
                                    amount: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!budget) {
                throw new NotFoundPersistenceError();
            }

            if (budget.status !== "ACTIVE") {
                throw new AppError("El presupuesto ya se encuentra cerrado", "INVALID_BUDGET_STATUS", 400);
            }

            const incomeByUser = new Map<string, Decimal>();
            let totalIncomeDec = new Decimal(0);

            for (const inc of budget.incomes) {
                const amountDec = new Decimal(inc.amount.toString());
                totalIncomeDec = totalIncomeDec.plus(amountDec);
                incomeByUser.set(inc.userId, (incomeByUser.get(inc.userId) ?? new Decimal(0)).plus(amountDec));
            }

            const spentByUser = new Map<string, Decimal>();
            let totalSpentDec = new Decimal(0);

            for (const item of budget.items) {
                for (const exp of item.expenses) {
                    const expDec = new Decimal(exp.amount.toString());
                    totalSpentDec = totalSpentDec.plus(expDec);
                    spentByUser.set(
                        exp.paidByUserId,
                        (spentByUser.get(exp.paidByUserId) ?? new Decimal(0)).plus(expDec)
                    );
                }
            }

            const totalIncomeRounded = totalIncomeDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
            const totalSpentRounded = totalSpentDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
            const totalRemainderDec = totalIncomeRounded.minus(totalSpentRounded).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

            const savedAmountDec = new Decimal(savedAmount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
            const maxSaveable = Decimal.max(0, totalRemainderDec);

            if (savedAmountDec.gt(maxSaveable)) {
                throw new AppError(
                    "El monto a ahorrar no puede superar el sobrante real",
                    "INVALID_SAVED_AMOUNT",
                    400
                );
            }

            const carriedOverAmountDec = totalRemainderDec.gt(0)
                ? totalRemainderDec.minus(savedAmountDec).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
                : new Decimal(0);

            const teamMembers = await client.teamMember.findMany({
                where: { teamId },
                select: { userId: true },
            });

            const userIds = new Set<string>([
                ...teamMembers.map((m) => m.userId),
                ...incomeByUser.keys(),
                ...spentByUser.keys(),
            ]);

            const userRemaindersData = Array.from(userIds).map((userId) => {
                const contributed = (incomeByUser.get(userId) ?? new Decimal(0)).toDecimalPlaces(
                    2,
                    Decimal.ROUND_HALF_UP
                );
                const spent = (spentByUser.get(userId) ?? new Decimal(0)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
                const remainder = contributed.minus(spent).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

                return {
                    userId,
                    contributedIncome: contributed.toFixed(2),
                    totalSpent: spent.toFixed(2),
                    remainderAmount: remainder.toFixed(2),
                };
            });

            const closing = await client.budgetClosing.create({
                data: {
                    budgetId: budget.id,
                    totalIncome: totalIncomeRounded.toFixed(2),
                    totalSpent: totalSpentRounded.toFixed(2),
                    totalRemainder: totalRemainderDec.toFixed(2),
                    savedAmount: savedAmountDec.toFixed(2),
                    carriedOverAmount: carriedOverAmountDec.toFixed(2),
                    isCarryoverProcessed: false,
                    userRemainders: {
                        create: userRemaindersData,
                    },
                },
                include: {
                    userRemainders: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                        orderBy: { remainderAmount: "desc" },
                    },
                },
            });

            await client.budget.update({
                where: { id: budget.id },
                data: { status: "CLOSED" },
            });

            return BudgetMapper.mapClosingDetail(closing);
        } catch (error) {
            if (error instanceof AppError || error instanceof NotFoundPersistenceError) {
                throw error;
            }
            throw PrismaErrorMapper.map(error);
        }
    }

    async create(teamId: string, data: BudgetCreateInput): Promise<Budget> {
        try {
            const created = await this.prisma.budget.create({
                data: {
                    teamId,
                    name: data.name,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    status: "ACTIVE",
                },
            });
            return BudgetMapper.map(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(budgetId: string, teamId: string, data: BudgetUpdateInput): Promise<Budget> {
        try {
            const existing = await this.prisma.budget.findFirst({
                where: { id: budgetId, teamId },
            });
            if (!existing) {
                throw new NotFoundPersistenceError();
            }

            const updated = await this.prisma.budget.update({
                where: { id: budgetId },
                data: {
                    ...(data.name !== undefined ? { name: data.name } : {}),
                    ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
                    ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
                },
            });

            return BudgetMapper.map(updated);
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(budgetId: string, teamId: string): Promise<void> {
        try {
            const result = await this.prisma.budget.deleteMany({
                where: { id: budgetId, teamId },
            });
            if (result.count === 0) {
                throw new NotFoundPersistenceError();
            }
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async getPendingCarryover(teamId: string): Promise<PendingCarryoverResponse> {
        try {
            const closing = await this.prisma.budgetClosing.findFirst({
                where: {
                    carriedOverAmount: { gt: 0 },
                    isCarryoverProcessed: false,
                    budget: {
                        teamId,
                        status: "CLOSED",
                    },
                },
                orderBy: { closedAt: "desc" },
                include: {
                    budget: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    userRemainders: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                        orderBy: { remainderAmount: "desc" },
                    },
                },
            });

            if (!closing) {
                return {
                    hasPendingCarryover: false,
                    closingId: null,
                    sourceBudgetId: null,
                    sourceBudgetName: null,
                    carriedOverAmount: 0,
                    userRemainders: [],
                };
            }

            return {
                hasPendingCarryover: true,
                closingId: closing.id,
                sourceBudgetId: closing.budget.id,
                sourceBudgetName: closing.budget.name,
                carriedOverAmount: new Decimal(closing.carriedOverAmount.toString())
                    .toDecimalPlaces(2)
                    .toNumber(),
                userRemainders: closing.userRemainders.map((r) => BudgetMapper.mapUserRemainder(r)),
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async applyCarryover(budgetId: string, teamId: string, tx?: unknown): Promise<ApplyCarryoverResult> {
        const client = (tx as Prisma.TransactionClient) ?? this.prisma;

        try {
            const targetBudget = await client.budget.findFirst({
                where: { id: budgetId, teamId },
            });
            if (!targetBudget) {
                throw new NotFoundPersistenceError();
            }
            if (targetBudget.status !== "ACTIVE") {
                throw new AppError(
                    "Solo se puede aplicar sobrante a un presupuesto activo",
                    "INVALID_BUDGET_STATUS",
                    400
                );
            }

            const closing = await client.budgetClosing.findFirst({
                where: {
                    carriedOverAmount: { gt: 0 },
                    isCarryoverProcessed: false,
                    budget: {
                        teamId,
                        status: "CLOSED",
                    },
                },
                orderBy: { closedAt: "desc" },
                include: {
                    budget: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    userRemainders: true,
                },
            });

            if (!closing) {
                throw new AppError(
                    "No existe un sobrante pendiente por procesar para este equipo",
                    "DATA_NOT_FOUND",
                    404
                );
            }

            const systemCategory = await client.incomeCategory.findFirst({
                where: {
                    teamId,
                    isSystem: true,
                    name: "Sobrante presupuesto anterior",
                },
            });

            if (!systemCategory) {
                throw new AppError(
                    "No se encontró la categoría de sistema 'Sobrante presupuesto anterior'",
                    "DATA_NOT_FOUND",
                    404
                );
            }

            const carriedOverDec = new Decimal(closing.carriedOverAmount.toString()).toDecimalPlaces(2);
            const savedAmountDec = new Decimal(closing.savedAmount.toString()).toDecimalPlaces(2);

            const positiveRemainders = closing.userRemainders.filter((r) =>
                new Decimal(r.remainderAmount.toString()).gt(0)
            );

            if (positiveRemainders.length === 0) {
                throw new AppError(
                    "No hay sobrantes positivos por usuario para transferir",
                    "INVALID_DATA",
                    400
                );
            }

            const sumPositiveDec = positiveRemainders.reduce(
                (acc, r) => acc.plus(new Decimal(r.remainderAmount.toString())),
                new Decimal(0)
            );

            const shares: Array<{ userId: string; amount: Decimal }> = [];

            if (savedAmountDec.eq(0) && sumPositiveDec.eq(carriedOverDec)) {
                for (const rem of positiveRemainders) {
                    shares.push({
                        userId: rem.userId,
                        amount: new Decimal(rem.remainderAmount.toString()).toDecimalPlaces(2),
                    });
                }
            } else {
                let allocated = new Decimal(0);
                for (let i = 0; i < positiveRemainders.length; i++) {
                    const rem = positiveRemainders[i];
                    if (!rem) continue;

                    let share: Decimal;
                    if (i === positiveRemainders.length - 1) {
                        share = carriedOverDec.minus(allocated).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
                    } else {
                        share = carriedOverDec
                            .times(new Decimal(rem.remainderAmount.toString()))
                            .dividedBy(sumPositiveDec)
                            .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
                        allocated = allocated.plus(share);
                    }

                    if (share.gt(0)) {
                        shares.push({ userId: rem.userId, amount: share });
                    }
                }
            }

            const createdIncomes: AppliedCarryoverIncome[] = [];
            const now = new Date();
            const description = `Sobrante presupuesto anterior (${closing.budget.name})`;

            for (const share of shares) {
                if (share.amount.lte(0)) continue;
                const created = await client.income.create({
                    data: {
                        budgetId: targetBudget.id,
                        categoryId: systemCategory.id,
                        userId: share.userId,
                        amount: share.amount.toFixed(2),
                        description,
                        isCarryover: true,
                        date: now,
                    },
                });
                createdIncomes.push(BudgetMapper.mapAppliedIncome(created));
            }

            await client.budgetClosing.update({
                where: { id: closing.id },
                data: { isCarryoverProcessed: true },
            });

            return {
                closingId: closing.id,
                sourceBudgetId: closing.budget.id,
                targetBudgetId: targetBudget.id,
                carriedOverAmount: carriedOverDec.toNumber(),
                createdIncomes,
            };
        } catch (error) {
            if (error instanceof AppError || error instanceof NotFoundPersistenceError) {
                throw error;
            }
            throw PrismaErrorMapper.map(error);
        }
    }
}
