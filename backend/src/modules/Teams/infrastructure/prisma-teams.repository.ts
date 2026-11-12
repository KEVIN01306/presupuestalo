import type { PrismaClient } from "@prisma/client";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";
import type {
    Team,
    TeamCreateInput,
    TeamDetail,
    TeamMemberDetail,
    TeamOwnerSummary,
    TeamRoleType,
    TeamSummary,
    TeamUpdateInput,
} from "../domain/team.entity.js";
import type { TeamsRepository } from "../domain/teams.repository.js";
import { TeamMapper } from "./mappers/team.mapper.js";

const USER_SUMMARY_SELECT = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    avatarUrl: true,
} as const;

const CURRENCY_SELECT = {
    id: true,
    code: true,
    name: true,
    symbol: true,
} as const;

export class PrismaTeamsRepository implements TeamsRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async listByUser(userId: string): Promise<TeamSummary[]> {
        try {
            const memberships = await this.prisma.teamMember.findMany({
                where: { userId },
                include: {
                    team: {
                        include: {
                            owner: { select: USER_SUMMARY_SELECT },
                            currency: { select: CURRENCY_SELECT },
                            _count: { select: { members: true } },
                        },
                    },
                },
                orderBy: [{ team: { isPersonal: "desc" } }, { team: { createdAt: "asc" } }],
            });

            return memberships.map((m) => TeamMapper.mapSummary(m));
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(teamId: string): Promise<Team | null> {
        try {
            const team = await this.prisma.team.findUnique({
                where: { id: teamId },
                include: {
                    currency: { select: CURRENCY_SELECT },
                },
            });
            return team ? TeamMapper.mapTeam(team) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByIdWithMembers(teamId: string): Promise<TeamDetail | null> {
        try {
            const team = await this.prisma.team.findUnique({
                where: { id: teamId },
                include: {
                    owner: { select: USER_SUMMARY_SELECT },
                    currency: { select: CURRENCY_SELECT },
                    members: {
                        include: {
                            user: { select: USER_SUMMARY_SELECT },
                        },
                        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
                    },
                },
            });

            return team ? TeamMapper.mapDetail(team) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async createSharedTeam(data: TeamCreateInput, ownerId: string): Promise<TeamDetail> {
        try {
            const created = await this.prisma.$transaction(async (tx) => {
                let resolvedCurrencyId = data.currencyId ?? null;
                if (!resolvedCurrencyId) {
                    const usdCurrency = await tx.currency.findUnique({
                        where: { code: "USD" },
                        select: { id: true },
                    });
                    resolvedCurrencyId = usdCurrency?.id ?? null;
                }

                const team = await tx.team.create({
                    data: {
                        name: data.name,
                        description: data.description ?? null,
                        isPersonal: false,
                        ownerId,
                        currencyId: resolvedCurrencyId,
                    },
                });

                await tx.teamMember.create({
                    data: {
                        teamId: team.id,
                        userId: ownerId,
                        role: "OWNER",
                    },
                });

                await tx.incomeCategory.createMany({
                    data: [
                        {
                            teamId: team.id,
                            name: "Salario mensual",
                            isSystem: false,
                        },
                        {
                            teamId: team.id,
                            name: "Sobrante presupuesto anterior",
                            isSystem: true,
                        },
                    ],
                });

                return await tx.team.findUniqueOrThrow({
                    where: { id: team.id },
                    include: {
                        owner: { select: USER_SUMMARY_SELECT },
                        currency: { select: CURRENCY_SELECT },
                        members: {
                            include: {
                                user: { select: USER_SUMMARY_SELECT },
                            },
                            orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
                        },
                    },
                });
            });

            return TeamMapper.mapDetail(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(teamId: string, data: TeamUpdateInput): Promise<Team> {
        try {
            const updated = await this.prisma.team.update({
                where: { id: teamId },
                data: {
                    ...(data.name !== undefined ? { name: data.name } : {}),
                    ...(data.description !== undefined ? { description: data.description } : {}),
                    ...(data.currencyId !== undefined ? { currencyId: data.currencyId } : {}),
                },
                include: {
                    currency: { select: CURRENCY_SELECT },
                },
            });

            return TeamMapper.mapTeam(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(teamId: string): Promise<void> {
        try {
            const result = await this.prisma.team.deleteMany({
                where: { id: teamId },
            });
            if (result.count === 0) {
                throw new NotFoundPersistenceError();
            }
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async findUserByEmail(email: string): Promise<TeamOwnerSummary | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: email.toLowerCase() },
                select: USER_SUMMARY_SELECT,
            });
            return user ? TeamMapper.mapUserSummary(user) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findMemberById(teamId: string, memberId: string): Promise<TeamMemberDetail | null> {
        try {
            const member = await this.prisma.teamMember.findFirst({
                where: { id: memberId, teamId },
                include: { user: { select: USER_SUMMARY_SELECT } },
            });
            return member ? TeamMapper.mapMember(member) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findMemberByUserId(teamId: string, userId: string): Promise<TeamMemberDetail | null> {
        try {
            const member = await this.prisma.teamMember.findUnique({
                where: { teamId_userId: { teamId, userId } },
                include: { user: { select: USER_SUMMARY_SELECT } },
            });
            return member ? TeamMapper.mapMember(member) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async countOwners(teamId: string): Promise<number> {
        try {
            return await this.prisma.teamMember.count({
                where: { teamId, role: "OWNER" },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async addMember(teamId: string, userId: string, role: TeamRoleType): Promise<TeamMemberDetail> {
        try {
            const member = await this.prisma.teamMember.create({
                data: {
                    teamId,
                    userId,
                    role: TeamMapper.toPrismaRole(role),
                },
                include: { user: { select: USER_SUMMARY_SELECT } },
            });
            return TeamMapper.mapMember(member);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async updateMemberRole(teamId: string, memberId: string, role: TeamRoleType): Promise<TeamMemberDetail> {
        try {
            const existing = await this.prisma.teamMember.findFirst({
                where: { id: memberId, teamId },
            });
            if (!existing) {
                throw new NotFoundPersistenceError();
            }

            const updated = await this.prisma.teamMember.update({
                where: { id: memberId },
                data: { role: TeamMapper.toPrismaRole(role) },
                include: { user: { select: USER_SUMMARY_SELECT } },
            });
            return TeamMapper.mapMember(updated);
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async removeMember(teamId: string, memberId: string): Promise<void> {
        try {
            const result = await this.prisma.teamMember.deleteMany({
                where: { id: memberId, teamId },
            });
            if (result.count === 0) {
                throw new NotFoundPersistenceError();
            }
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }
}
