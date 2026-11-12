import type {
    BudgetCeilingContext,
    BudgetItem,
    BudgetItemCreateInput,
    BudgetItemDeleteContext,
    BudgetItemUpdateContext,
    BudgetItemUpdateInput,
} from "./budget-item.entity.js";

export interface BudgetItemsRepository {
    budgetExists(budgetId: string, teamId: string): Promise<boolean>;
    listByBudget(budgetId: string, teamId: string): Promise<BudgetItem[]>;
    getBudgetCeilingContext(budgetId: string, teamId: string): Promise<BudgetCeilingContext | null>;
    findByIdForUpdate(itemId: string, teamId: string): Promise<BudgetItemUpdateContext | null>;
    findByIdForDelete(itemId: string, teamId: string): Promise<BudgetItemDeleteContext | null>;
    areUsersTeamMembers(userIds: string[], teamId: string): Promise<boolean>;
    create(budgetId: string, data: BudgetItemCreateInput): Promise<BudgetItem>;
    update(itemId: string, data: BudgetItemUpdateInput, replaceAllocations: boolean): Promise<BudgetItem>;
    delete(itemId: string): Promise<void>;
}
