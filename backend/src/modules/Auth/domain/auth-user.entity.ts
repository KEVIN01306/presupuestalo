export type TeamRole = "OWNER" | "EDITOR" | "VIEWER";

export interface AuthTeamCurrency {
    id: string;
    code: string;
    name: string;
    symbol: string;
}

export interface AuthTeamMembership {
    teamId: string;
    role: TeamRole;
    joinedAt: Date;
    team: {
        id: string;
        name: string;
        description?: string | null;
        isPersonal: boolean;
        ownerId: string;
        currencyId?: string | null;
        currency?: AuthTeamCurrency | null;
    };
}

export interface AuthUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string | null;
    googleId?: string | null;
    avatarUrl?: string | null;
    isActive: boolean;
    isVerify: boolean;
    teamMemberships: AuthTeamMembership[];
    createdAt?: Date;
}
