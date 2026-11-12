import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../../../core/store/authStore';
import { getCurrentUser } from '../../../auth/infrastructure/services/auth.service';
import type {
    CurrencyItem,
    IncomeCategory,
    TeamDetail,
    TeamRole,
    TeamSummary,
} from '../../domain/interfaces/team.interface';
import type {
    AddTeamMemberFormValues,
    IncomeCategoryFormValues,
    TeamFormValues,
} from '../../domain/schemas/team.schema';
import {
    IncomeCategoryRepository,
    TeamRepository,
} from '../../infrastructure/repositories/team.repository';

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

export const useTeams = () => {
    const { accessToken, activeTeamId, setUser, switchTeam } = useAuthStore();
    const [teams, setTeams] = useState<TeamSummary[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(activeTeamId);
    const [teamDetail, setTeamDetail] = useState<TeamDetail | null>(null);
    const [categories, setCategories] = useState<IncomeCategory[]>([]);
    const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
    const [loadingList, setLoadingList] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [toast, setToast] = useState<ToastState | null>(null);

    const notify = (message: string, severity: 'success' | 'error' = 'success') =>
        setToast({ message, severity });

    const refreshAuthStore = useCallback(async () => {
        if (!accessToken) return;
        try {
            const freshUser = await getCurrentUser(accessToken);
            setUser(freshUser);
        } catch {
            // Non-blocking sync
        }
    }, [accessToken, setUser]);

    const fetchTeams = useCallback(async () => {
        setLoadingList(true);
        try {
            const list = await TeamRepository.listar();
            setTeams(list);
            setSelectedTeamId((prev) => {
                if (prev && list.some((t) => t.id === prev)) return prev;
                if (activeTeamId && list.some((t) => t.id === activeTeamId)) return activeTeamId;
                return list[0]?.id ?? null;
            });
        } catch (err) {
            notify(getErrorMessage(err, 'No se pudieron cargar los equipos.'), 'error');
        } finally {
            setLoadingList(false);
        }
    }, [activeTeamId]);

    const fetchDetail = useCallback(async (teamId: string | null) => {
        if (!teamId) {
            setTeamDetail(null);
            setCategories([]);
            return;
        }
        setLoadingDetail(true);
        try {
            const [detail, cats] = await Promise.all([
                TeamRepository.obtener(teamId),
                IncomeCategoryRepository.listar(teamId),
            ]);
            setTeamDetail(detail);
            setCategories(cats);
        } catch (err) {
            notify(getErrorMessage(err, 'No se pudo cargar el detalle del equipo.'), 'error');
        } finally {
            setLoadingDetail(false);
        }
    }, []);

    useEffect(() => {
        fetchTeams();
        TeamRepository.listCurrencies().then(setCurrencies).catch(() => {});
    }, [fetchTeams]);

    useEffect(() => {
        fetchDetail(selectedTeamId);
    }, [selectedTeamId, fetchDetail]);

    const handleCreateTeam = async (values: TeamFormValues) => {
        const created = await TeamRepository.crear(values);
        await Promise.all([fetchTeams(), refreshAuthStore()]);
        setSelectedTeamId(created.id);
        notify('Equipo creado correctamente.');
    };

    const handleUpdateTeam = async (values: TeamFormValues) => {
        if (!selectedTeamId) return;
        await TeamRepository.actualizar(selectedTeamId, values);
        await Promise.all([fetchTeams(), fetchDetail(selectedTeamId), refreshAuthStore()]);
        notify('Equipo actualizado correctamente.');
    };

    const handleDeleteTeam = async () => {
        if (!selectedTeamId) return;
        await TeamRepository.eliminar(selectedTeamId);
        setSelectedTeamId(null);
        await Promise.all([fetchTeams(), refreshAuthStore()]);
        notify('Equipo eliminado correctamente.');
    };

    const handleAddMember = async (values: AddTeamMemberFormValues) => {
        if (!selectedTeamId) return;
        await TeamRepository.agregarMiembro(selectedTeamId, values);
        await Promise.all([fetchTeams(), fetchDetail(selectedTeamId)]);
        notify('Miembro agregado al equipo.');
    };

    const handleChangeMemberRole = async (memberId: string, role: TeamRole) => {
        if (!selectedTeamId) return;
        try {
            await TeamRepository.actualizarRolMiembro(selectedTeamId, memberId, role);
            await fetchDetail(selectedTeamId);
            notify('Rol actualizado correctamente.');
        } catch (err) {
            notify(getErrorMessage(err, 'No se pudo actualizar el rol.'), 'error');
        }
    };

    const handleExpelMember = async (memberId: string) => {
        if (!selectedTeamId) return;
        await TeamRepository.expulsarMiembro(selectedTeamId, memberId);
        await Promise.all([fetchTeams(), fetchDetail(selectedTeamId)]);
        notify('Miembro expulsado del equipo.');
    };

    const handleCreateCategory = async (values: IncomeCategoryFormValues) => {
        if (!selectedTeamId) return;
        await IncomeCategoryRepository.crear(selectedTeamId, values);
        await fetchDetail(selectedTeamId);
        notify('Categoría de ingreso creada.');
    };

    const handleUpdateCategory = async (categoryId: string, values: IncomeCategoryFormValues) => {
        if (!selectedTeamId) return;
        await IncomeCategoryRepository.actualizar(selectedTeamId, categoryId, values);
        await fetchDetail(selectedTeamId);
        notify('Categoría de ingreso actualizada.');
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!selectedTeamId) return;
        await IncomeCategoryRepository.eliminar(selectedTeamId, categoryId);
        await fetchDetail(selectedTeamId);
        notify('Categoría de ingreso eliminada.');
    };

    const handleSwitchTeam = (teamId: string) => {
        switchTeam(teamId);
        setSelectedTeamId(teamId);
        notify('Equipo activo actualizado.');
    };

    const selectedSummary = teams.find((t) => t.id === selectedTeamId) ?? null;

    return {
        teams,
        selectedTeamId,
        selectedSummary,
        teamDetail,
        categories,
        currencies,
        activeTeamId,
        loadingList,
        loadingDetail,
        toast,
        clearToast: () => setToast(null),
        setSelectedTeamId,
        handleSwitchTeam,
        handleCreateTeam,
        handleUpdateTeam,
        handleDeleteTeam,
        handleAddMember,
        handleChangeMemberRole,
        handleExpelMember,
        handleCreateCategory,
        handleUpdateCategory,
        handleDeleteCategory,
    };
};
