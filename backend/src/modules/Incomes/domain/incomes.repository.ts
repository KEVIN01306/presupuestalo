import type {
    Income,
    IncomeBudgetContext,
    IncomeCreateInput,
    IncomeListResponse,
    IncomeUpdateInput,
} from "./income.entity.js";

export interface IncomesRepository {
    listByBudget(budgetId: string, teamId: string): Promise<IncomeListResponse>;
    findBudgetStatus(budgetId: string, teamId: string): Promise<"ACTIVE" | "CLOSED" | null>;
    findByIdWithContext(incomeId: string, teamId: string): Promise<IncomeBudgetContext | null>;
    categoryBelongsToTeam(categoryId: string, teamId: string): Promise<boolean>;
    userBelongsToTeam(userId: string, teamId: string): Promise<boolean>;
    getBudgetTotals(budgetId: string, teamId: string): Promise<{ totalIncome: string; totalProjected: string }>;
    create(budgetId: string, data: IncomeCreateInput): Promise<Income>;
    update(incomeId: string, data: IncomeUpdateInput): Promise<Income>;
    delete(incomeId: string): Promise<void>;
}
