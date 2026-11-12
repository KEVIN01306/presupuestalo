export type BudgetStatus = "ACTIVE" | "CLOSED";

export interface Budget {
    id: string;
    teamId: string;
    name: string;
    startDate: Date;
    endDate: Date;
    status: BudgetStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface BudgetSummary extends Budget {
    totalIncome: number;
    totalProjected: number;
    totalSpent: number;
    remainingToAllocate: number;
    remainingCash: number;
}

export interface BudgetClosingSummary {
    id: string;
    budgetId: string;
    totalIncome: number;
    totalSpent: number;
    totalRemainder: number;
    savedAmount: number;
    carriedOverAmount: number;
    isCarryoverProcessed: boolean;
    closedAt: Date;
}

export interface BudgetDetail extends BudgetSummary {
    closing: BudgetClosingSummary | null;
}

export interface BudgetCreateInput {
    name: string;
    startDate: Date;
    endDate: Date;
}

export interface BudgetUpdateInput {
    name?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface CarryoverUserRemainder {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    contributedIncome: number;
    totalSpent: number;
    remainderAmount: number;
}

export interface PendingCarryoverResponse {
    hasPendingCarryover: boolean;
    closingId: string | null;
    sourceBudgetId: string | null;
    sourceBudgetName: string | null;
    carriedOverAmount: number;
    userRemainders: CarryoverUserRemainder[];
}

export interface AppliedCarryoverIncome {
    id: string;
    budgetId: string;
    categoryId: string;
    userId: string;
    amount: number;
    description: string | null;
    isCarryover: boolean;
    date: Date;
}

export interface ApplyCarryoverResult {
    closingId: string;
    sourceBudgetId: string;
    targetBudgetId: string;
    carriedOverAmount: number;
    createdIncomes: AppliedCarryoverIncome[];
}

export interface BudgetClosingDetail extends BudgetClosingSummary {
    userRemainders: CarryoverUserRemainder[];
}

export interface BudgetDashboardBudget {
    id: string;
    teamId: string;
    name: string;
    startDate: Date;
    endDate: Date;
    status: BudgetStatus;
}

export interface BudgetDashboardGlobal {
    totalIncome: number;
    totalProjected: number;
    projectedRemainder: number;
    totalSpent: number;
    realRemainder: number;
}

export interface BudgetUserSegmentation {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
    role: "OWNER" | "EDITOR" | "VIEWER";
    contributedIncome: number;
    assignedToPay: number;
    totalPaid: number;
    remainingToPay: number;
    projectedRemainder: number;
    realRemainder: number;
}

export interface BudgetItemAllocationProgress {
    userId: string;
    firstName: string;
    lastName: string;
    assignedAmount: number;
    paidAmount: number;
    remainingAmount: number;
    progressPercent: number;
}

export interface BudgetItemProgress {
    id: string;
    name: string;
    projectedAmount: number;
    hasUserSplit: boolean;
    totalSpent: number;
    remainingAmount: number;
    progressPercent: number;
    allocations: BudgetItemAllocationProgress[];
}

export interface DailyMemberSeries {
    userId: string;
    name: string;
    data: number[];
}

export interface DailySpendingByMember {
    dates: string[];
    series: DailyMemberSeries[];
}

export interface WeekdaySpendingItem {
    day: string;
    totalSpent: number;
}

export interface TopSpentItem {
    id: string;
    name: string;
    totalSpent: number;
    projectedAmount: number;
}

export interface BudgetDashboardAnalytics {
    dailySpendingByMember: DailySpendingByMember;
    weekdaySpending: WeekdaySpendingItem[];
    topItems: TopSpentItem[];
}

export interface BudgetDashboardSummary {
    budget: BudgetDashboardBudget;
    global: BudgetDashboardGlobal;
    currentUserSummary: BudgetUserSegmentation | null;
    userSegmentation: BudgetUserSegmentation[];
    itemsProgress: BudgetItemProgress[];
    closing: BudgetClosingDetail | null;
    analytics: BudgetDashboardAnalytics;
}

export interface CloseBudgetInput {
    savedAmount: number;
}
