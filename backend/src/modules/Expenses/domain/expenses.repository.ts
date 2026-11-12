import type {
    Expense,
    ExpenseBudgetItemLimitContext,
    ExpenseCreateInput,
    ExpenseExistingContext,
    ExpenseListFilters,
    ExpenseUpdateInput,
} from "./expense.entity.js";

export interface ExpensesRepository {
    budgetExists(budgetId: string, teamId: string): Promise<boolean>;
    listByBudget(budgetId: string, teamId: string, filters?: ExpenseListFilters): Promise<Expense[]>;
    findBudgetStatus(budgetId: string, teamId: string): Promise<"ACTIVE" | "CLOSED" | null>;
    userBelongsToTeam(userId: string, teamId: string): Promise<boolean>;
    getBudgetItemLimitContext(
        budgetItemId: string,
        budgetId: string,
        teamId: string,
        paidByUserId: string,
        excludeExpenseId?: string
    ): Promise<ExpenseBudgetItemLimitContext | null>;
    findByIdWithContext(expenseId: string, teamId: string): Promise<ExpenseExistingContext | null>;
    create(data: Required<Pick<ExpenseCreateInput, "budgetItemId" | "paidByUserId" | "amount">> & {
        createdByUserId: string;
        date: Date;
        description: string | null;
    }): Promise<Expense>;
    update(expenseId: string, data: ExpenseUpdateInput): Promise<Expense>;
    delete(expenseId: string): Promise<void>;
}
