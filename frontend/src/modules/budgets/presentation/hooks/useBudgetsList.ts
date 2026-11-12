import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../../../core/store/authStore';
import type { BudgetSummary, PendingCarryoverResponse } from '../../domain/interfaces/budget.interface';
import type { CreateBudgetFormValues } from '../../domain/schemas/budget.schema';
import { BudgetRepository } from '../../infrastructure/repositories/budget.repository';

export interface ToastState {
    message: string;
    severity: 'success' | 'error';
}

const getErrorMessage = (err: unknown, fallback: string): string => {
    if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as { message?: string } | undefined)?.message;
        if (msg) return msg;
    }
    return fallback;
};

export const useBudgetsList = () => {
    const { activeTeamId, activeTeam, activeRole } = useAuthStore();
    const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
    const [pendingCarryover, setPendingCarryover] = useState<PendingCarryoverResponse | null>(null);
    const [carryoverTargetBudgetId, setCarryoverTargetBudgetId] = useState<string | null>(null);
    const [carryoverModalOpen, setCarryoverModalOpen] = useState(false);
    const [applyingCarryover, setApplyingCarryover] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<ToastState | null>(null);

    const canEdit = activeRole === 'OWNER' || activeRole === 'EDITOR';

    const fetchBudgets = useCallback(async () => {
        if (!activeTeamId) {
            setBudgets([]);
            setPendingCarryover(null);
            return;
        }
        setLoading(true);
        try {
            const [list, carryover] = await Promise.all([
                BudgetRepository.listarPorEquipo(activeTeamId),
                BudgetRepository.obtenerCarryoverPendiente(activeTeamId),
            ]);
            setBudgets(list);
            setPendingCarryover(carryover);

            const activeBudget = list.find((b) => b.status === 'ACTIVE');
            if (carryover.hasPendingCarryover && activeBudget && canEdit) {
                setCarryoverTargetBudgetId(activeBudget.id);
                setCarryoverModalOpen(true);
            }
        } catch (err) {
            setToast({ message: getErrorMessage(err, 'No se pudieron cargar los presupuestos.'), severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [activeTeamId, canEdit]);

    useEffect(() => {
        void Promise.resolve().then(() => fetchBudgets());
    }, [fetchBudgets]);

    const handleCreateBudget = async (values: CreateBudgetFormValues) => {
        if (!activeTeamId) return;
        const created = await BudgetRepository.crear(activeTeamId, values);
        setToast({ message: 'Presupuesto creado correctamente.', severity: 'success' });

        const carryover = await BudgetRepository.obtenerCarryoverPendiente(activeTeamId);
        setPendingCarryover(carryover);
        await fetchBudgets();

        if (carryover.hasPendingCarryover) {
            setCarryoverTargetBudgetId(created.id);
            setCarryoverModalOpen(true);
        }
    };

    const handleApplyCarryover = async () => {
        if (!carryoverTargetBudgetId) return;
        setApplyingCarryover(true);
        try {
            await BudgetRepository.aplicarCarryover(carryoverTargetBudgetId);
            setCarryoverModalOpen(false);
            setCarryoverTargetBudgetId(null);
            setToast({ message: 'Sobrante aplicado al presupuesto.', severity: 'success' });
            await fetchBudgets();
        } catch (err) {
            setToast({ message: getErrorMessage(err, 'No se pudo aplicar el sobrante.'), severity: 'error' });
        } finally {
            setApplyingCarryover(false);
        }
    };

    return {
        activeTeamId,
        activeTeam,
        canEdit,
        budgets,
        pendingCarryover,
        carryoverModalOpen,
        applyingCarryover,
        loading,
        toast,
        clearToast: () => setToast(null),
        closeCarryoverModal: () => setCarryoverModalOpen(false),
        handleCreateBudget,
        handleApplyCarryover,
        refresh: fetchBudgets,
    };
};
