import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../../../core/store/authStore';
import type { IncomeCategory, TeamMemberDetail } from '../../../teams/domain/interfaces/team.interface';
import {
    IncomeCategoryRepository,
    TeamRepository,
} from '../../../teams/infrastructure/repositories/team.repository';
import type {
    BudgetDashboardSummary,
    BudgetItem,
    Expense,
    Income,
} from '../../domain/interfaces/budget.interface';
import type {
    BudgetItemFormValues,
    CloseBudgetFormValues,
    ExpenseFormValues,
    IncomeFormValues,
} from '../../domain/schemas/budget.schema';
import { BudgetRepository } from '../../infrastructure/repositories/budget.repository';
import type { ToastState } from './useBudgetsList';

const getErrorMessage = (err: unknown, fallback: string): string => {
    if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as { message?: string } | undefined)?.message;
        if (msg) return msg;
    }
    return fallback;
};

export const useBudgetDetail = (budgetId: string | undefined) => {
    const { activeTeamId, activeRole, user } = useAuthStore();
    const [summary, setSummary] = useState<BudgetDashboardSummary | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMemberDetail[]>([]);
    const [categories, setCategories] = useState<IncomeCategory[]>([]);
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [items, setItems] = useState<BudgetItem[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<ToastState | null>(null);

    const notify = (message: string, severity: 'success' | 'error' = 'success') =>
        setToast({ message, severity });

    const fetchAll = useCallback(async () => {
        if (!budgetId) return;
        setLoading(true);
        try {
            const summaryData = await BudgetRepository.obtenerResumen(budgetId);
            const teamId = summaryData.budget.teamId || activeTeamId;

            const [incomesRes, itemsRes, expensesRes, teamRes, catsRes] = await Promise.all([
                BudgetRepository.listarIngresos(budgetId),
                BudgetRepository.listarRubros(budgetId),
                BudgetRepository.listarGastos(budgetId),
                teamId ? TeamRepository.obtener(teamId) : Promise.resolve(null),
                teamId ? IncomeCategoryRepository.listar(teamId) : Promise.resolve([]),
            ]);

            setSummary(summaryData);
            setIncomes(incomesRes.incomes);
            setItems(itemsRes);
            setExpenses(expensesRes);
            setTeamMembers(teamRes?.members ?? []);
            setCategories(catsRes);
        } catch (err) {
            notify(getErrorMessage(err, 'No se pudo cargar el detalle del presupuesto.'), 'error');
        } finally {
            setLoading(false);
        }
    }, [budgetId, activeTeamId]);

    useEffect(() => {
        void Promise.resolve().then(() => fetchAll());
    }, [fetchAll]);

    const isRoleEditable = activeRole === 'OWNER' || activeRole === 'EDITOR';
    const isActive = summary?.budget.status === 'ACTIVE';
    const canEdit = Boolean(isActive && isRoleEditable);

    const saveIncome = async (values: IncomeFormValues, incomeId?: string) => {
        if (!budgetId) return;
        if (incomeId) {
            await BudgetRepository.actualizarIngreso(incomeId, values);
            notify('Ingreso actualizado.');
        } else {
            await BudgetRepository.crearIngreso(budgetId, values);
            notify('Ingreso registrado.');
        }
        await fetchAll();
    };

    const deleteIncome = async (incomeId: string) => {
        try {
            await BudgetRepository.eliminarIngreso(incomeId);
            notify('Ingreso eliminado.');
            await fetchAll();
        } catch (err) {
            notify(getErrorMessage(err, 'No se pudo eliminar el ingreso.'), 'error');
        }
    };

    const saveItem = async (values: BudgetItemFormValues, itemId?: string) => {
        if (!budgetId) return;
        if (itemId) {
            await BudgetRepository.actualizarRubro(itemId, values);
            notify('Rubro actualizado.');
        } else {
            await BudgetRepository.crearRubro(budgetId, values);
            notify('Rubro creado.');
        }
        await fetchAll();
    };

    const deleteItem = async (itemId: string) => {
        try {
            await BudgetRepository.eliminarRubro(itemId);
            notify('Rubro eliminado.');
            await fetchAll();
        } catch (err) {
            notify(getErrorMessage(err, 'No se pudo eliminar el rubro.'), 'error');
        }
    };

    const saveExpense = async (values: ExpenseFormValues, expenseId?: string) => {
        if (!budgetId) return;
        if (expenseId) {
            await BudgetRepository.actualizarGasto(expenseId, values);
            notify('Gasto actualizado.');
        } else {
            await BudgetRepository.crearGasto(budgetId, values);
            notify('Gasto registrado.');
        }
        await fetchAll();
    };

    const deleteExpense = async (expenseId: string) => {
        try {
            await BudgetRepository.eliminarGasto(expenseId);
            notify('Gasto eliminado.');
            await fetchAll();
        } catch (err) {
            notify(getErrorMessage(err, 'No se pudo eliminar el gasto.'), 'error');
        }
    };

    const closeBudget = async (values: CloseBudgetFormValues) => {
        if (!budgetId) return;
        await BudgetRepository.cerrar(budgetId, values);
        notify('Presupuesto cerrado correctamente.');
        await fetchAll();
    };

    return {
        currentUserId: user?.id ?? '',
        summary,
        teamMembers,
        categories,
        incomes,
        items,
        expenses,
        loading,
        canEdit,
        isRoleEditable,
        toast,
        clearToast: () => setToast(null),
        saveIncome,
        deleteIncome,
        saveItem,
        deleteItem,
        saveExpense,
        deleteExpense,
        closeBudget,
    };
};
