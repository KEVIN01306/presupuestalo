import type { Team as PrismaTeam, TeamMember as PrismaTeamMember, TeamRole } from "@prisma/client";
import type {
    Team,
    TeamCurrencySummary,
    TeamDetail,
    TeamMemberDetail,
    TeamOwnerSummary,
    TeamRoleType,
    TeamSummary,
} from "../../domain/team.entity.js";

export interface PrismaUserSummaryRecord {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
}

export interface PrismaCurrencySummaryRecord {
    id: string;
    code: string;
    name: string;
    symbol: string;
}

export interface PrismaTeamWithCurrency extends PrismaTeam {
    currency?: PrismaCurrencySummaryRecord | null;
}

export interface PrismaTeamMemberWithUser extends PrismaTeamMember {
    user: PrismaUserSummaryRecord;
}

export interface PrismaTeamWithDetails extends PrismaTeamWithCurrency {
    owner: PrismaUserSummaryRecord;
    members: PrismaTeamMemberWithUser[];
}

export interface PrismaTeamMembershipSummary extends PrismaTeamMember {
    team: PrismaTeamWithCurrency & {
        owner: PrismaUserSummaryRecord;
        _count: {
            members: number;
        };
    };
}

export class TeamMapper {
    static mapCurrencySummary(currency?: PrismaCurrencySummaryRecord | null): TeamCurrencySummary | null {
        if (!currency) return null;
        return {
            id: currency.id,
            code: currency.code,
            name: currency.name,
            symbol: currency.symbol,
        };
    }

    static mapUserSummary(user: PrismaUserSummaryRecord): TeamOwnerSummary {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatarUrl: user.avatarUrl,
        };
    }

    static mapTeam(record: PrismaTeamWithCurrency): Team {
        return {
            id: record.id,
            name: record.name,
            description: record.description,
            isPersonal: record.isPersonal,
            ownerId: record.ownerId,
            currencyId: record.currencyId,
            currency: TeamMapper.mapCurrencySummary(record.currency),
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        };
    }

    static mapMember(record: PrismaTeamMemberWithUser): TeamMemberDetail {
        return {
            id: record.id,
            teamId: record.teamId,
            userId: record.userId,
            role: record.role as TeamRoleType,
            joinedAt: record.joinedAt,
            user: TeamMapper.mapUserSummary(record.user),
        };
    }

    static mapSummary(membership: PrismaTeamMembershipSummary): TeamSummary {
        return {
            id: membership.team.id,
            name: membership.team.name,
            description: membership.team.description,
            isPersonal: membership.team.isPersonal,
            ownerId: membership.team.ownerId,
            currencyId: membership.team.currencyId,
            currency: TeamMapper.mapCurrencySummary(membership.team.currency),
            role: membership.role as TeamRoleType,
            membersCount: membership.team._count.members,
            owner: TeamMapper.mapUserSummary(membership.team.owner),
            createdAt: membership.team.createdAt,
            updatedAt: membership.team.updatedAt,
        };
    }

    static mapDetail(record: PrismaTeamWithDetails): TeamDetail {
        return {
            ...TeamMapper.mapTeam(record),
            owner: TeamMapper.mapUserSummary(record.owner),
            members: record.members.map((m) => TeamMapper.mapMember(m)),
        };
    }

    static toPrismaRole(role: TeamRoleType): TeamRole {
        return role as TeamRole;
    }
}
