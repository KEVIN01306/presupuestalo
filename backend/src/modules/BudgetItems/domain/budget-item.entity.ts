export interface BudgetItemUserSummary {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
}

export interface BudgetItemAllocation {
    id: string;
    budgetItemId: string;
    userId: string;
    assignedAmount: number;
    user?: BudgetItemUserSummary;
}

export interface BudgetItemAllocationInput {
    userId: string;
    assignedAmount: number;
}

export interface BudgetItem {
    id: string;
    budgetId: string;
    name: string;
    projectedAmount: number;
    hasUserSplit: boolean;
    createdAt: Date;
    updatedAt: Date;
    totalSpent: number;
    remainingAmount: number;
    allocations: BudgetItemAllocation[];
}

export interface BudgetItemCreateInput {
    name: string;
    projectedAmount: number;
    hasUserSplit: boolean;
    allocations?: BudgetItemAllocationInput[];
}

export interface BudgetItemUpdateInput {
    name?: string;
    projectedAmount?: number;
    hasUserSplit?: boolean;
    allocations?: BudgetItemAllocationInput[];
}

export interface BudgetCeilingContext {
    budgetId: string;
    status: "ACTIVE" | "CLOSED";
    totalIncome: string;
    existingProjectedSum: string;
}

export interface BudgetItemUpdateContext {
    item: BudgetItem;
    budgetStatus: "ACTIVE" | "CLOSED";
    teamId: string;
    totalIncome: string;
    existingProjectedSum: string;
    totalSpentOnItem: string;
    spentByUser: Record<string, string>;
}

export interface BudgetItemDeleteContext {
    item: BudgetItem;
    budgetStatus: "ACTIVE" | "CLOSED";
    teamId: string;
    expensesCount: number;
}
