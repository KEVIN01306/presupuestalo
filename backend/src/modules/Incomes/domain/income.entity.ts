export interface IncomeCategorySummary {
    id: string;
    name: string;
    isSystem: boolean;
}

export interface IncomeUserSummary {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface Income {
    id: string;
    budgetId: string;
    categoryId: string;
    userId: string;
    amount: number;
    description: string | null;
    isCarryover: boolean;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
    category?: IncomeCategorySummary;
    user?: IncomeUserSummary;
}

export interface IncomeListResponse {
    incomes: Income[];
    totalIncome: number;
}

export interface IncomeCreateInput {
    categoryId: string;
    userId: string;
    amount: number;
    description?: string | null;
    date?: Date;
}

export interface IncomeUpdateInput {
    categoryId?: string;
    userId?: string;
    amount?: number;
    description?: string | null;
    date?: Date;
}

export interface IncomeBudgetContext {
    income: Income;
    budgetStatus: "ACTIVE" | "CLOSED";
    teamId: string;
}
