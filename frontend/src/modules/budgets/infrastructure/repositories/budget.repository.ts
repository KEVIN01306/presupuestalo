import { api } from '../../../../core/api/axios.instance';
import type {
    ApplyCarryoverResult,
    Budget,
    BudgetApiResponse,
    BudgetClosingDetail,
    BudgetDashboardSummary,
    BudgetItem,
    BudgetSummary,
    Expense,
    Income,
    IncomeListResponse,
    PendingCarryoverResponse,
} from '../../domain/interfaces/budget.interface';
import type {
    BudgetItemFormValues,
    CloseBudgetFormValues,
    CreateBudgetFormValues,
    ExpenseFormValues,
    IncomeFormValues,
} from '../../domain/schemas/budget.schema';

export const BudgetRepository = {
    listarPorEquipo: async (teamId: string, signal?: AbortSignal): Promise<BudgetSummary[]> => {
        const res = await api.get<BudgetApiResponse<BudgetSummary[]>>(`/teams/${teamId}/budgets`, { signal });
        return res.data.data;
    },

    crear: async (teamId: string, data: CreateBudgetFormValues): Promise<Budget> => {
        const res = await api.post<BudgetApiResponse<Budget>>(`/teams/${teamId}/budgets`, data);
        return res.data.data;
    },

    obtenerCarryoverPendiente: async (
        teamId: string,
        signal?: AbortSignal
    ): Promise<PendingCarryoverResponse> => {
        const res = await api.get<BudgetApiResponse<PendingCarryoverResponse>>(
            `/teams/${teamId}/budgets/pending-carryover`,
            { signal }
        );
        return res.data.data;
    },

    aplicarCarryover: async (budgetId: string): Promise<ApplyCarryoverResult> => {
        const res = await api.post<BudgetApiResponse<ApplyCarryoverResult>>(
            `/budgets/${budgetId}/apply-carryover`
        );
        return res.data.data;
    },

    obtenerResumen: async (budgetId: string, signal?: AbortSignal): Promise<BudgetDashboardSummary> => {
        const res = await api.get<BudgetApiResponse<BudgetDashboardSummary>>(
            `/budgets/${budgetId}/summary`,
            { signal }
        );
        return res.data.data;
    },

    cerrar: async (budgetId: string, data: CloseBudgetFormValues): Promise<BudgetClosingDetail> => {
        const res = await api.post<BudgetApiResponse<BudgetClosingDetail>>(
            `/budgets/${budgetId}/close`,
            data
        );
        return res.data.data;
    },

    listarIngresos: async (budgetId: string, signal?: AbortSignal): Promise<IncomeListResponse> => {
        const res = await api.get<BudgetApiResponse<IncomeListResponse>>(
            `/budgets/${budgetId}/incomes`,
            { signal }
        );
        return res.data.data;
    },

    crearIngreso: async (budgetId: string, data: IncomeFormValues): Promise<Income> => {
        const payload = {
            ...data,
            description: data.description?.trim() || null,
        };
        const res = await api.post<BudgetApiResponse<Income>>(`/budgets/${budgetId}/incomes`, payload);
        return res.data.data;
    },

    actualizarIngreso: async (incomeId: string, data: Partial<IncomeFormValues>): Promise<Income> => {
        const payload = {
            ...data,
            description: data.description !== undefined ? data.description?.trim() || null : undefined,
        };
        const res = await api.put<BudgetApiResponse<Income>>(`/incomes/${incomeId}`, payload);
        return res.data.data;
    },

    eliminarIngreso: async (incomeId: string): Promise<void> => {
        await api.delete(`/incomes/${incomeId}`);
    },

    listarRubros: async (budgetId: string, signal?: AbortSignal): Promise<BudgetItem[]> => {
        const res = await api.get<BudgetApiResponse<BudgetItem[]>>(`/budgets/${budgetId}/items`, { signal });
        return res.data.data;
    },

    crearRubro: async (budgetId: string, data: BudgetItemFormValues): Promise<BudgetItem> => {
        const payload = {
            name: data.name.trim(),
            projectedAmount: data.projectedAmount,
            hasUserSplit: data.hasUserSplit,
            allocations: data.hasUserSplit ? data.allocations : undefined,
        };
        const res = await api.post<BudgetApiResponse<BudgetItem>>(`/budgets/${budgetId}/items`, payload);
        return res.data.data;
    },

    actualizarRubro: async (itemId: string, data: BudgetItemFormValues): Promise<BudgetItem> => {
        const payload = {
            name: data.name.trim(),
            projectedAmount: data.projectedAmount,
            hasUserSplit: data.hasUserSplit,
            allocations: data.hasUserSplit ? data.allocations : [],
        };
        const res = await api.put<BudgetApiResponse<BudgetItem>>(`/budget-items/${itemId}`, payload);
        return res.data.data;
    },

    eliminarRubro: async (itemId: string): Promise<void> => {
        await api.delete(`/budget-items/${itemId}`);
    },

    listarGastos: async (budgetId: string, signal?: AbortSignal): Promise<Expense[]> => {
        const res = await api.get<BudgetApiResponse<Expense[]>>(`/budgets/${budgetId}/expenses`, { signal });
        return res.data.data;
    },

    crearGasto: async (budgetId: string, data: ExpenseFormValues): Promise<Expense> => {
        const payload = {
            ...data,
            description: data.description?.trim() || null,
        };
        const res = await api.post<BudgetApiResponse<Expense>>(`/budgets/${budgetId}/expenses`, payload);
        return res.data.data;
    },

    actualizarGasto: async (expenseId: string, data: Partial<ExpenseFormValues>): Promise<Expense> => {
        const payload = {
            ...data,
            description: data.description !== undefined ? data.description?.trim() || null : undefined,
        };
        const res = await api.put<BudgetApiResponse<Expense>>(`/expenses/${expenseId}`, payload);
        return res.data.data;
    },

    eliminarGasto: async (expenseId: string): Promise<void> => {
        await api.delete(`/expenses/${expenseId}`);
    },
};
