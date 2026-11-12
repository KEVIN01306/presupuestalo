export interface ExpenseBudgetItemSummary {
    id: string;
    name: string;
}

export interface ExpenseUserSummary {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
}

export interface Expense {
    id: string;
    budgetItemId: string;
    paidByUserId: string;
    createdByUserId: string;
    amount: number;
    date: Date;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    budgetItem?: ExpenseBudgetItemSummary;
    paidBy?: ExpenseUserSummary;
    createdBy?: ExpenseUserSummary;
}

export interface ExpenseListFilters {
    budgetItemId?: string;
    paidByUserId?: string;
}

export interface ExpenseCreateInput {
    budgetItemId: string;
    paidByUserId?: string;
    amount: number;
    date?: Date;
    description?: string | null;
}

export interface ExpenseUpdateInput {
    budgetItemId?: string;
    paidByUserId?: string;
    amount?: number;
    date?: Date;
    description?: string | null;
}

export interface ExpenseBudgetItemLimitContext {
    id: string;
    budgetId: string;
    budgetStatus: "ACTIVE" | "CLOSED";
    projectedAmount: string;
    hasUserSplit: boolean;
    totalSpentExcluding: string;
    userAllocationAmount: string | null;
    userSpentExcluding: string;
}

export interface ExpenseExistingContext {
    expense: Expense;
    budgetId: string;
    budgetStatus: "ACTIVE" | "CLOSED";
    teamId: string;
}
