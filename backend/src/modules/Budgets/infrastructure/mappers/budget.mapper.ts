import { Decimal } from "decimal.js";
import type {
    Budget as PrismaBudget,
    BudgetClosing as PrismaBudgetClosing,
    BudgetClosingUserRemainder as PrismaUserRemainder,
    TeamRole,
} from "@prisma/client";
import type {
    AppliedCarryoverIncome,
    Budget,
    BudgetClosingDetail,
    BudgetClosingSummary,
    BudgetDashboardAnalytics,
    BudgetDashboardSummary,
    BudgetDetail,
    BudgetItemAllocationProgress,
    BudgetItemProgress,
    BudgetSummary,
    BudgetUserSegmentation,
    CarryoverUserRemainder,
    DailyMemberSeries,
    TopSpentItem,
    WeekdaySpendingItem,
} from "../../domain/budget.entity.js";

type BudgetWithTotalsRecord = PrismaBudget & {
    incomes: { amount: { toString(): string } }[];
    items: {
        projectedAmount: { toString(): string };
        expenses: { amount: { toString(): string } }[];
    }[];
};

type BudgetDetailRecord = BudgetWithTotalsRecord & {
    closing: PrismaBudgetClosing | null;
};

type UserRemainderWithUser = PrismaUserRemainder & {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
};

type ClosingWithRemainders = PrismaBudgetClosing & {
    userRemainders: UserRemainderWithUser[];
};

export type DashboardTeamMemberRecord = {
    userId: string;
    role: TeamRole;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatarUrl: string | null;
    };
};

export type DashboardBudgetRecord = PrismaBudget & {
    incomes: {
        userId: string;
        amount: { toString(): string };
    }[];
    items: {
        id: string;
        name: string;
        projectedAmount: { toString(): string };
        hasUserSplit: boolean;
        allocations: {
            userId: string;
            assignedAmount: { toString(): string };
            user: {
                id: string;
                firstName: string;
                lastName: string;
            };
        }[];
        expenses: {
            paidByUserId: string;
            amount: { toString(): string };
            date: Date;
        }[];
    }[];
    closing: ClosingWithRemainders | null;
};

export class BudgetMapper {
    static map(record: PrismaBudget): Budget {
        return {
            id: record.id,
            teamId: record.teamId,
            name: record.name,
            startDate: record.startDate,
            endDate: record.endDate,
            status: record.status,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        };
    }

    static mapSummary(record: BudgetWithTotalsRecord): BudgetSummary {
        const totalIncomeDec = record.incomes.reduce(
            (acc, inc) => acc.plus(new Decimal(inc.amount.toString())),
            new Decimal(0)
        );

        const totalProjectedDec = record.items.reduce(
            (acc, item) => acc.plus(new Decimal(item.projectedAmount.toString())),
            new Decimal(0)
        );

        const totalSpentDec = record.items.reduce((acc, item) => {
            const itemSpent = item.expenses.reduce(
                (expAcc, exp) => expAcc.plus(new Decimal(exp.amount.toString())),
                new Decimal(0)
            );
            return acc.plus(itemSpent);
        }, new Decimal(0));

        const remainingToAllocateDec = totalIncomeDec.minus(totalProjectedDec);
        const remainingCashDec = totalIncomeDec.minus(totalSpentDec);

        return {
            ...BudgetMapper.map(record),
            totalIncome: totalIncomeDec.toDecimalPlaces(2).toNumber(),
            totalProjected: totalProjectedDec.toDecimalPlaces(2).toNumber(),
            totalSpent: totalSpentDec.toDecimalPlaces(2).toNumber(),
            remainingToAllocate: remainingToAllocateDec.toDecimalPlaces(2).toNumber(),
            remainingCash: remainingCashDec.toDecimalPlaces(2).toNumber(),
        };
    }

    static mapClosing(closing: PrismaBudgetClosing): BudgetClosingSummary {
        return {
            id: closing.id,
            budgetId: closing.budgetId,
            totalIncome: new Decimal(closing.totalIncome.toString()).toDecimalPlaces(2).toNumber(),
            totalSpent: new Decimal(closing.totalSpent.toString()).toDecimalPlaces(2).toNumber(),
            totalRemainder: new Decimal(closing.totalRemainder.toString()).toDecimalPlaces(2).toNumber(),
            savedAmount: new Decimal(closing.savedAmount.toString()).toDecimalPlaces(2).toNumber(),
            carriedOverAmount: new Decimal(closing.carriedOverAmount.toString()).toDecimalPlaces(2).toNumber(),
            isCarryoverProcessed: closing.isCarryoverProcessed,
            closedAt: closing.closedAt,
        };
    }

    static mapDetail(record: BudgetDetailRecord): BudgetDetail {
        return {
            ...BudgetMapper.mapSummary(record),
            closing: record.closing ? BudgetMapper.mapClosing(record.closing) : null,
        };
    }

    static mapUserRemainder(record: UserRemainderWithUser): CarryoverUserRemainder {
        return {
            id: record.id,
            userId: record.userId,
            firstName: record.user.firstName,
            lastName: record.user.lastName,
            email: record.user.email,
            contributedIncome: new Decimal(record.contributedIncome.toString()).toDecimalPlaces(2).toNumber(),
            totalSpent: new Decimal(record.totalSpent.toString()).toDecimalPlaces(2).toNumber(),
            remainderAmount: new Decimal(record.remainderAmount.toString()).toDecimalPlaces(2).toNumber(),
        };
    }

    static mapAppliedIncome(record: {
        id: string;
        budgetId: string;
        categoryId: string;
        userId: string;
        amount: { toString(): string };
        description: string | null;
        isCarryover: boolean;
        date: Date;
    }): AppliedCarryoverIncome {
        return {
            id: record.id,
            budgetId: record.budgetId,
            categoryId: record.categoryId,
            userId: record.userId,
            amount: new Decimal(record.amount.toString()).toDecimalPlaces(2).toNumber(),
            description: record.description,
            isCarryover: record.isCarryover,
            date: record.date,
        };
    }

    static mapClosingDetail(closing: ClosingWithRemainders): BudgetClosingDetail {
        return {
            ...BudgetMapper.mapClosing(closing),
            userRemainders: closing.userRemainders.map((r) => BudgetMapper.mapUserRemainder(r)),
        };
    }

    static mapDashboardSummary(
        record: DashboardBudgetRecord,
        teamMembers: DashboardTeamMemberRecord[],
        currentUserId: string
    ): BudgetDashboardSummary {
        const incomeByUser = new Map<string, Decimal>();
        let totalIncomeDec = new Decimal(0);

        for (const inc of record.incomes) {
            const amountDec = new Decimal(inc.amount.toString());
            totalIncomeDec = totalIncomeDec.plus(amountDec);
            incomeByUser.set(inc.userId, (incomeByUser.get(inc.userId) ?? new Decimal(0)).plus(amountDec));
        }

        const assignedByUser = new Map<string, Decimal>();
        const paidByUser = new Map<string, Decimal>();
        let totalProjectedDec = new Decimal(0);
        let totalSpentDec = new Decimal(0);

        const itemsProgress: BudgetItemProgress[] = record.items.map((item) => {
            const projectedDec = new Decimal(item.projectedAmount.toString());
            totalProjectedDec = totalProjectedDec.plus(projectedDec);

            const itemPaidByUser = new Map<string, Decimal>();
            let itemSpentDec = new Decimal(0);

            for (const exp of item.expenses) {
                const expDec = new Decimal(exp.amount.toString());
                itemSpentDec = itemSpentDec.plus(expDec);
                totalSpentDec = totalSpentDec.plus(expDec);
                paidByUser.set(exp.paidByUserId, (paidByUser.get(exp.paidByUserId) ?? new Decimal(0)).plus(expDec));
                itemPaidByUser.set(
                    exp.paidByUserId,
                    (itemPaidByUser.get(exp.paidByUserId) ?? new Decimal(0)).plus(expDec)
                );
            }

            const allocations: BudgetItemAllocationProgress[] = item.hasUserSplit
                ? item.allocations.map((alloc) => {
                      const assignedDec = new Decimal(alloc.assignedAmount.toString());
                      assignedByUser.set(
                          alloc.userId,
                          (assignedByUser.get(alloc.userId) ?? new Decimal(0)).plus(assignedDec)
                      );

                      const paidDec = itemPaidByUser.get(alloc.userId) ?? new Decimal(0);
                      const remainingDec = Decimal.max(0, assignedDec.minus(paidDec));
                      const progressPercent = assignedDec.gt(0)
                          ? paidDec.dividedBy(assignedDec).times(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()
                          : 0;

                      return {
                          userId: alloc.userId,
                          firstName: alloc.user.firstName,
                          lastName: alloc.user.lastName,
                          assignedAmount: assignedDec.toDecimalPlaces(2).toNumber(),
                          paidAmount: paidDec.toDecimalPlaces(2).toNumber(),
                          remainingAmount: remainingDec.toDecimalPlaces(2).toNumber(),
                          progressPercent,
                      };
                  })
                : [];

            const itemRemainingDec = projectedDec.minus(itemSpentDec);
            const itemProgressPercent = projectedDec.gt(0)
                ? itemSpentDec.dividedBy(projectedDec).times(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()
                : 0;

            return {
                id: item.id,
                name: item.name,
                projectedAmount: projectedDec.toDecimalPlaces(2).toNumber(),
                hasUserSplit: item.hasUserSplit,
                totalSpent: itemSpentDec.toDecimalPlaces(2).toNumber(),
                remainingAmount: itemRemainingDec.toDecimalPlaces(2).toNumber(),
                progressPercent: itemProgressPercent,
                allocations,
            };
        });

        const userSegmentation: BudgetUserSegmentation[] = teamMembers.map((member) => {
            const contributedDec = incomeByUser.get(member.userId) ?? new Decimal(0);
            const assignedDec = assignedByUser.get(member.userId) ?? new Decimal(0);
            const paidDec = paidByUser.get(member.userId) ?? new Decimal(0);
            const remainingToPayDec = Decimal.max(0, assignedDec.minus(paidDec));
            const projectedRemDec = contributedDec.minus(assignedDec);
            const realRemDec = contributedDec.minus(paidDec);

            return {
                userId: member.user.id,
                firstName: member.user.firstName,
                lastName: member.user.lastName,
                email: member.user.email,
                avatarUrl: member.user.avatarUrl,
                role: member.role,
                contributedIncome: contributedDec.toDecimalPlaces(2).toNumber(),
                assignedToPay: assignedDec.toDecimalPlaces(2).toNumber(),
                totalPaid: paidDec.toDecimalPlaces(2).toNumber(),
                remainingToPay: remainingToPayDec.toDecimalPlaces(2).toNumber(),
                projectedRemainder: projectedRemDec.toDecimalPlaces(2).toNumber(),
                realRemainder: realRemDec.toDecimalPlaces(2).toNumber(),
            };
        });

        const currentUserSummary = userSegmentation.find((u) => u.userId === currentUserId) ?? null;
        const analytics = BudgetMapper.buildDashboardAnalytics(record, teamMembers, itemsProgress);

        return {
            budget: {
                id: record.id,
                teamId: record.teamId,
                name: record.name,
                startDate: record.startDate,
                endDate: record.endDate,
                status: record.status,
            },
            global: {
                totalIncome: totalIncomeDec.toDecimalPlaces(2).toNumber(),
                totalProjected: totalProjectedDec.toDecimalPlaces(2).toNumber(),
                projectedRemainder: totalIncomeDec.minus(totalProjectedDec).toDecimalPlaces(2).toNumber(),
                totalSpent: totalSpentDec.toDecimalPlaces(2).toNumber(),
                realRemainder: totalIncomeDec.minus(totalSpentDec).toDecimalPlaces(2).toNumber(),
            },
            currentUserSummary,
            userSegmentation,
            itemsProgress,
            closing: record.status === "CLOSED" && record.closing ? BudgetMapper.mapClosingDetail(record.closing) : null,
            analytics,
        };
    }

    private static buildDashboardAnalytics(
        record: DashboardBudgetRecord,
        teamMembers: DashboardTeamMemberRecord[],
        itemsProgress: BudgetItemProgress[]
    ): BudgetDashboardAnalytics {
        const MS_PER_DAY = 24 * 60 * 60 * 1000;
        const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

        const dailyByUserAndDate = new Map<string, Map<string, Decimal>>();
        const expenseDatesSet = new Set<string>();
        const weekdayTotals = WEEKDAY_LABELS.map(() => new Decimal(0));

        for (const item of record.items) {
            for (const exp of item.expenses) {
                const expDec = new Decimal(exp.amount.toString());
                const dateKey = exp.date.toISOString().slice(0, 10);
                expenseDatesSet.add(dateKey);

                let userMap = dailyByUserAndDate.get(exp.paidByUserId);
                if (!userMap) {
                    userMap = new Map<string, Decimal>();
                    dailyByUserAndDate.set(exp.paidByUserId, userMap);
                }
                userMap.set(dateKey, (userMap.get(dateKey) ?? new Decimal(0)).plus(expDec));

                const utcDay = exp.date.getUTCDay();
                const weekdayIndex = utcDay === 0 ? 6 : utcDay - 1;
                weekdayTotals[weekdayIndex] = weekdayTotals[weekdayIndex]!.plus(expDec);
            }
        }

        const startUtcMs = Date.UTC(
            record.startDate.getUTCFullYear(),
            record.startDate.getUTCMonth(),
            record.startDate.getUTCDate()
        );
        const endUtcMs = Date.UTC(
            record.endDate.getUTCFullYear(),
            record.endDate.getUTCMonth(),
            record.endDate.getUTCDate()
        );
        const diffDays = Math.round((endUtcMs - startUtcMs) / MS_PER_DAY);

        let dates: string[];
        if (diffDays >= 0 && diffDays <= 62) {
            dates = Array.from({ length: diffDays + 1 }, (_, i) =>
                new Date(startUtcMs + i * MS_PER_DAY).toISOString().slice(0, 10)
            );
        } else {
            dates = Array.from(expenseDatesSet).sort();
        }

        const series: DailyMemberSeries[] = teamMembers.map((member) => {
            const userMap = dailyByUserAndDate.get(member.user.id);
            return {
                userId: member.user.id,
                name: `${member.user.firstName} ${member.user.lastName}`.trim(),
                data: dates.map((d) =>
                    (userMap?.get(d) ?? new Decimal(0)).toDecimalPlaces(2).toNumber()
                ),
            };
        });

        const weekdaySpending: WeekdaySpendingItem[] = WEEKDAY_LABELS.map((day, idx) => ({
            day,
            totalSpent: weekdayTotals[idx]!.toDecimalPlaces(2).toNumber(),
        }));

        const topItems: TopSpentItem[] = [...itemsProgress]
            .filter((item) => item.totalSpent > 0)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 6)
            .map((item) => ({
                id: item.id,
                name: item.name,
                totalSpent: item.totalSpent,
                projectedAmount: item.projectedAmount,
            }));

        return {
            dailySpendingByMember: {
                dates,
                series,
            },
            weekdaySpending,
            topItems,
        };
    }
}
