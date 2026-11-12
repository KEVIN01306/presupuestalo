import { api } from '../../../../core/api/axios.instance';
import type {
    CurrencyItem,
    IncomeCategory,
    TeamApiResponse,
    TeamDetail,
    TeamMemberDetail,
    TeamRole,
    TeamSummary,
} from '../../domain/interfaces/team.interface';
import type {
    AddTeamMemberFormValues,
    IncomeCategoryFormValues,
    TeamFormValues,
} from '../../domain/schemas/team.schema';

export const TeamRepository = {
    listCurrencies: async (signal?: AbortSignal): Promise<CurrencyItem[]> => {
        const res = await api.get<TeamApiResponse<CurrencyItem[]>>('/currencies', { signal });
        return res.data.data;
    },

    listar: async (signal?: AbortSignal): Promise<TeamSummary[]> => {
        const res = await api.get<TeamApiResponse<TeamSummary[]>>('/teams', { signal });
        return res.data.data;
    },

    obtener: async (teamId: string, signal?: AbortSignal): Promise<TeamDetail> => {
        const res = await api.get<TeamApiResponse<TeamDetail>>(`/teams/${teamId}`, { signal });
        return res.data.data;
    },

    crear: async (data: TeamFormValues): Promise<TeamDetail> => {
        const payload = {
            name: data.name.trim(),
            description: data.description?.trim() || null,
            ...(data.currencyId ? { currencyId: data.currencyId } : {}),
        };
        const res = await api.post<TeamApiResponse<TeamDetail>>('/teams', payload);
        return res.data.data;
    },

    actualizar: async (teamId: string, data: TeamFormValues): Promise<TeamDetail> => {
        const payload = {
            name: data.name.trim(),
            description: data.description?.trim() || null,
            ...(data.currencyId ? { currencyId: data.currencyId } : {}),
        };
        const res = await api.put<TeamApiResponse<TeamDetail>>(`/teams/${teamId}`, payload);
        return res.data.data;
    },

    eliminar: async (teamId: string): Promise<void> => {
        await api.delete(`/teams/${teamId}`);
    },

    agregarMiembro: async (teamId: string, data: AddTeamMemberFormValues): Promise<TeamMemberDetail> => {
        const res = await api.post<TeamApiResponse<TeamMemberDetail>>(`/teams/${teamId}/members`, data);
        return res.data.data;
    },

    actualizarRolMiembro: async (
        teamId: string,
        memberId: string,
        role: TeamRole
    ): Promise<TeamMemberDetail> => {
        const res = await api.patch<TeamApiResponse<TeamMemberDetail>>(
            `/teams/${teamId}/members/${memberId}`,
            { role }
        );
        return res.data.data;
    },

    expulsarMiembro: async (teamId: string, memberId: string): Promise<void> => {
        await api.delete(`/teams/${teamId}/members/${memberId}`);
    },
};

export const IncomeCategoryRepository = {
    listar: async (teamId: string, signal?: AbortSignal): Promise<IncomeCategory[]> => {
        const res = await api.get<TeamApiResponse<IncomeCategory[]>>(
            `/teams/${teamId}/income-categories`,
            { signal }
        );
        return res.data.data;
    },

    crear: async (teamId: string, data: IncomeCategoryFormValues): Promise<IncomeCategory> => {
        const res = await api.post<TeamApiResponse<IncomeCategory>>(
            `/teams/${teamId}/income-categories`,
            data
        );
        return res.data.data;
    },

    actualizar: async (
        teamId: string,
        categoryId: string,
        data: IncomeCategoryFormValues
    ): Promise<IncomeCategory> => {
        const res = await api.put<TeamApiResponse<IncomeCategory>>(
            `/teams/${teamId}/income-categories/${categoryId}`,
            data
        );
        return res.data.data;
    },

    eliminar: async (teamId: string, categoryId: string): Promise<void> => {
        await api.delete(`/teams/${teamId}/income-categories/${categoryId}`);
    },
};
