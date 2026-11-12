export type TeamRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface TeamCurrency {
    id: string;
    code: string;
    name: string;
    symbol: string;
}

export interface AuthTeam {
    id: string;
    name: string;
    description?: string | null;
    isPersonal: boolean;
    ownerId: string;
    currencyId?: string | null;
    currency?: TeamCurrency | null;
}

export interface AuthTeamMembership {
    teamId: string;
    role: TeamRole;
    joinedAt: string | Date;
    team: AuthTeam;
}

export interface AuthUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
    googleId?: string | null;
    isActive: boolean;
    isVerify: boolean;
    teamMemberships: AuthTeamMembership[];
    createdAt?: string | Date;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
}
