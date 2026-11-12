import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    AuthTeam,
    AuthTeamMembership,
    AuthUser,
    TeamRole,
} from '../../modules/auth/domain/interfaces/auth.interfaces';

interface ResolvedTeamState {
    teams: AuthTeamMembership[];
    activeTeamId: string | null;
    activeTeam: AuthTeam | null;
    activeRole: TeamRole | null;
}

const resolveTeamState = (
    memberships: AuthTeamMembership[],
    preferredTeamId: string | null
): ResolvedTeamState => {
    if (!memberships || memberships.length === 0) {
        return { teams: [], activeTeamId: null, activeTeam: null, activeRole: null };
    }

    const matched =
        (preferredTeamId && memberships.find((m) => m.teamId === preferredTeamId)) ||
        memberships.find((m) => m.team.isPersonal) ||
        memberships[0];

    return {
        teams: memberships,
        activeTeamId: matched.teamId,
        activeTeam: matched.team,
        activeRole: matched.role,
    };
};

interface AuthState {
    accessToken: string | null;
    user: AuthUser | null;
    teams: AuthTeamMembership[];
    activeTeamId: string | null;
    activeTeam: AuthTeam | null;
    activeRole: TeamRole | null;
    isRestoringSession: boolean;
    setAuth: (token: string, user: AuthUser) => void;
    setToken: (token: string) => void;
    setUser: (user: AuthUser | null) => void;
    switchTeam: (teamId: string) => void;
    setIsRestoringSession: (isRestoring: boolean) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            accessToken: null,
            user: null,
            teams: [],
            activeTeamId: null,
            activeTeam: null,
            activeRole: null,
            isRestoringSession: false,

            setAuth: (token, user) => {
                const resolved = resolveTeamState(
                    user.teamMemberships ?? [],
                    get().activeTeamId
                );
                set({ accessToken: token, user, ...resolved });
            },

            setToken: (token) => set({ accessToken: token }),

            setUser: (user) => {
                if (!user) {
                    set({ user: null, teams: [], activeTeamId: null, activeTeam: null, activeRole: null });
                    return;
                }
                const resolved = resolveTeamState(
                    user.teamMemberships ?? [],
                    get().activeTeamId
                );
                set({ user, ...resolved });
            },

            switchTeam: (teamId) => {
                const { teams } = get();
                const membership = teams.find((m) => m.teamId === teamId);
                if (!membership) return;
                set({
                    activeTeamId: membership.teamId,
                    activeTeam: membership.team,
                    activeRole: membership.role,
                });
            },

            setIsRestoringSession: (isRestoringSession) => set({ isRestoringSession }),

            clearAuth: () =>
                set({
                    accessToken: null,
                    user: null,
                    teams: [],
                    activeTeamId: null,
                    activeTeam: null,
                    activeRole: null,
                }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                accessToken: state.accessToken,
                activeTeamId: state.activeTeamId,
            }),
        }
    )
);
