import type {
    ApplyCarryoverResult,
    Budget,
    BudgetClosingDetail,
    BudgetCreateInput,
    BudgetDashboardSummary,
    BudgetDetail,
    BudgetSummary,
    BudgetUpdateInput,
    PendingCarryoverResponse,
} from "./budget.entity.js";

export interface BudgetsRepository {
    listByTeam(teamId: string): Promise<BudgetSummary[]>;
    findById(budgetId: string, teamId: string): Promise<BudgetDetail | null>;
    getDashboardSummary(
        budgetId: string,
        teamId: string,
        currentUserId: string
    ): Promise<BudgetDashboardSummary | null>;
    create(teamId: string, data: BudgetCreateInput): Promise<Budget>;
    update(budgetId: string, teamId: string, data: BudgetUpdateInput): Promise<Budget>;
    delete(budgetId: string, teamId: string): Promise<void>;
    closeBudget(
        budgetId: string,
        teamId: string,
        savedAmount: number,
        tx?: unknown
    ): Promise<BudgetClosingDetail>;
    getPendingCarryover(teamId: string): Promise<PendingCarryoverResponse>;
    applyCarryover(budgetId: string, teamId: string, tx?: unknown): Promise<ApplyCarryoverResult>;
}
