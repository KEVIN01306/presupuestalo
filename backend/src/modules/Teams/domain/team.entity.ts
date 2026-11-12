export type TeamRoleType = "OWNER" | "EDITOR" | "VIEWER";

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
    role: TeamRoleType;
    joinedAt: Date;
    user: TeamOwnerSummary;
}

export interface TeamCurrencySummary {
    id: string;
    code: string;
    name: string;
    symbol: string;
}

export interface Team {
    id: string;
    name: string;
    description: string | null;
    isPersonal: boolean;
    ownerId: string;
    currencyId: string | null;
    currency?: TeamCurrencySummary | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface TeamSummary {
    id: string;
    name: string;
    description: string | null;
    isPersonal: boolean;
    ownerId: string;
    currencyId: string | null;
    currency?: TeamCurrencySummary | null;
    role: TeamRoleType;
    membersCount: number;
    owner: TeamOwnerSummary;
    createdAt: Date;
    updatedAt: Date;
}

export interface TeamDetail extends Team {
    owner: TeamOwnerSummary;
    members: TeamMemberDetail[];
}

export interface TeamCreateInput {
    name: string;
    description?: string | null;
    currencyId?: string | null;
}

export interface TeamUpdateInput {
    name?: string;
    description?: string | null;
    currencyId?: string;
}

export interface AddTeamMemberInput {
    email: string;
    role?: TeamRoleType;
}

export interface UpdateTeamMemberRoleInput {
    role: TeamRoleType;
}
