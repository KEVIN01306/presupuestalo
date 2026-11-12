export type TeamRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface CurrencyItem {
    id: string;
    code: string;
    name: string;
    symbol: string;
}

export interface TeamOwnerSummary {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
}

export interface TeamMemberDetail {
    id: string;
    teamId: string;
    userId: string;
    role: TeamRole;
    joinedAt: string;
    user: TeamOwnerSummary;
}

export interface TeamSummary {
    id: string;
    name: string;
    description: string | null;
    isPersonal: boolean;
    ownerId: string;
    currencyId?: string | null;
    currency?: CurrencyItem | null;
    role: TeamRole;
    membersCount: number;
    owner: TeamOwnerSummary;
    createdAt: string;
    updatedAt: string;
}

export interface TeamDetail {
    id: string;
    name: string;
    description: string | null;
    isPersonal: boolean;
    ownerId: string;
    currencyId?: string | null;
    currency?: CurrencyItem | null;
    createdAt: string;
    updatedAt: string;
    owner: TeamOwnerSummary;
    members: TeamMemberDetail[];
}

export interface IncomeCategory {
    id: string;
    teamId: string;
    name: string;
    isSystem: boolean;
    createdAt: string;
}

export interface TeamApiResponse<T> {
    status: string;
    message: string;
    data: T;
}
