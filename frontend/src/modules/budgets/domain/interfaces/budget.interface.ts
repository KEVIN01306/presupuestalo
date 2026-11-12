export type BudgetStatus = 'ACTIVE' | 'CLOSED';
export type TeamRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface Budget {
    id: string;
    teamId: string;
    name: string;
    startDate: string;
    endDate: string;
    status: BudgetStatus;
    createdAt: string;
    updatedAt: string;
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
    closedAt: string;
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

export interface BudgetClosingDetail extends BudgetClosingSummary {
    userRemainders: CarryoverUserRemainder[];
}

export interface PendingCarryoverResponse {
    hasPendingCarryover: boolean;
    closingId: string | null;
    sourceBudgetId: string | null;
    sourceBudgetName: string | null;
    carriedOverAmount: number;
    userRemainders: CarryoverUserRemainder[];
}

export interface ApplyCarryoverResult {
    closingId: string;
    sourceBudgetId: string;
    targetBudgetId: string;
    carriedOverAmount: number;
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
    role: TeamRole;
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
    budget: Pick<Budget, 'id' | 'teamId' | 'name' | 'startDate' | 'endDate' | 'status'>;
    global: BudgetDashboardGlobal;
    currentUserSummary: BudgetUserSegmentation | null;
    userSegmentation: BudgetUserSegmentation[];
    itemsProgress: BudgetItemProgress[];
    closing: BudgetClosingDetail | null;
    analytics?: BudgetDashboardAnalytics;
}

export interface Income {
    id: string;
    budgetId: string;
    categoryId: string;
    userId: string;
    amount: number;
    description: string | null;
    isCarryover: boolean;
    date: string;
    category?: { id: string; name: string; isSystem: boolean };
    user?: { id: string; firstName: string; lastName: string; email: string };
}

export interface IncomeListResponse {
    incomes: Income[];
    totalIncome: number;
}

export interface BudgetItemAllocation {
    id: string;
    budgetItemId: string;
    userId: string;
    assignedAmount: number;
    user?: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null };
}

export interface BudgetItem {
    id: string;
    budgetId: string;
    name: string;
    projectedAmount: number;
    hasUserSplit: boolean;
    totalSpent: number;
    remainingAmount: number;
    allocations: BudgetItemAllocation[];
}

export interface Expense {
    id: string;
    budgetItemId: string;
    paidByUserId: string;
    createdByUserId: string;
    amount: number;
    date: string;
    description: string | null;
    budgetItem?: { id: string; name: string };
    paidBy?: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null };
}

export interface BudgetApiResponse<T> {
    status: string;
    message: string;
    data: T;
}
