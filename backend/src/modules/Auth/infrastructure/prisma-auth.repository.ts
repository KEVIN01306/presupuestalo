import type { PrismaClient } from "@prisma/client";
import type { AuthRepository, CreatePersonalUserDTO } from "../domain/auth.repository.js";
import type { AuthUser } from "../domain/auth-user.entity.js";
import type { AuthSession } from "../domain/auth-session.entity.js";
import { AuthMapper } from "./mappers/auth.mapper.js";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";

const teamMembershipsInclude = {
    teamMemberships: {
        include: {
            team: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    isPersonal: true,
                    ownerId: true,
                    currencyId: true,
                    currency: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                            symbol: true,
                        },
                    },
                },
            },
        },
        orderBy: { joinedAt: "asc" as const },
    },
};

export class PrismaAuthRespository implements AuthRepository {
    constructor(private readonly db: PrismaClient) {}

    async findByEmail(email: AuthUser["email"]): Promise<AuthUser | null> {
        try {
            const user = await this.db.user.findFirst({
                where: { email: email.toLowerCase().trim(), isActive: true },
                include: teamMembershipsInclude,
            });

            if (!user) return null;
            return AuthMapper.toDomain(user);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByGoogleId(googleId: string): Promise<AuthUser | null> {
        try {
            const user = await this.db.user.findFirst({
                where: { googleId, isActive: true },
                include: teamMembershipsInclude,
            });

            if (!user) return null;
            return AuthMapper.toDomain(user);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: AuthUser["id"]): Promise<AuthUser | null> {
        try {
            const user = await this.db.user.findFirst({
                where: { id, isActive: true },
                include: teamMembershipsInclude,
            });

            if (!user) return null;
            return AuthMapper.toDomain(user);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async createWithPersonalSpace(data: CreatePersonalUserDTO): Promise<AuthUser> {
        try {
            const createdUser = await this.db.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        email: data.email.toLowerCase().trim(),
                        passwordHash: data.passwordHash ?? null,
                        googleId: data.googleId ?? null,
                        firstName: data.firstName.trim(),
                        lastName: data.lastName.trim(),
                        avatarUrl: data.avatarUrl ?? null,
                        isActive: true,
                        isVerify: data.isVerify,
                    },
                });

                const usdCurrency = await tx.currency.findUnique({
                    where: { code: "USD" },
                    select: { id: true },
                });

                const personalTeam = await tx.team.create({
                    data: {
                        name: "Mi Espacio Personal",
                        description: "Espacio personal de presupuestos",
                        isPersonal: true,
                        ownerId: user.id,
                        currencyId: usdCurrency?.id ?? null,
                    },
                });

                await tx.teamMember.create({
                    data: {
                        teamId: personalTeam.id,
                        userId: user.id,
                        role: "OWNER",
                    },
                });

                await tx.incomeCategory.createMany({
                    data: [
                        {
                            teamId: personalTeam.id,
                            name: "Salario mensual",
                            isSystem: false,
                        },
                        {
                            teamId: personalTeam.id,
                            name: "Sobrante presupuesto anterior",
                            isSystem: true,
                        },
                    ],
                });

                return tx.user.findUniqueOrThrow({
                    where: { id: user.id },
                    include: teamMembershipsInclude,
                });
            });

            return AuthMapper.toDomain(createdUser);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async linkGoogleAccount(
        userId: string,
        googleId: string,
        avatarUrl?: string | null
    ): Promise<AuthUser> {
        try {
            const existing = await this.db.user.findUnique({
                where: { id: userId },
                select: { avatarUrl: true },
            });

            const updated = await this.db.user.update({
                where: { id: userId },
                data: {
                    googleId,
                    isVerify: true,
                    ...(existing?.avatarUrl ? {} : { avatarUrl: avatarUrl ?? null }),
                },
                include: teamMembershipsInclude,
            });

            return AuthMapper.toDomain(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async upsertSession(
        userId: AuthUser["id"],
        token: AuthSession["token"],
        expiresAt: Date
    ): Promise<void> {
        await this.db.userSession.upsert({
            where: { userId },
            update: {
                token,
                expiresAt,
            },
            create: {
                userId,
                token,
                expiresAt,
            },
        });
    }

    async findSessionByToken(token: AuthSession["token"]): Promise<AuthSession | null> {
        const sessionDb = await this.db.userSession.findUnique({
            where: { token },
        });

        if (!sessionDb) return null;

        return {
            id: sessionDb.id,
            token: sessionDb.token,
            userId: sessionDb.userId,
            expiresAt: sessionDb.expiresAt,
            createdAt: sessionDb.createdAt,
        };
    }

    async findSessionByUserId(userId: AuthUser["id"]): Promise<AuthSession | null> {
        const sessionDb = await this.db.userSession.findFirst({
            where: { userId },
        });

        if (!sessionDb) return null;

        return {
            id: sessionDb.id,
            token: sessionDb.token,
            userId: sessionDb.userId,
            expiresAt: sessionDb.expiresAt,
            createdAt: sessionDb.createdAt,
        };
    }

    async deleteSession(userId: AuthUser["id"]): Promise<void> {
        await this.db.userSession.deleteMany({
            where: { userId },
        });
    }
}
