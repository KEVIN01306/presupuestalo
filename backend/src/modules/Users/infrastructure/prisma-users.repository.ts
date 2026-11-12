import type { PrismaClient } from "@prisma/client";
import type { UsersRepository } from "../domain/users.repository.js";
import type { User, CreateUser, UpdateUser, GetUser, GetSimpleUser } from "../domain/user.entity.js";
import { UsersMapper } from "./mappers/users.mapper.js";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";

export class PrismaUsersRepository implements UsersRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateUser): Promise<GetUser> {
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: data.email.toLowerCase().trim(),
                    passwordHash: data.passwordHash ?? null,
                    googleId: data.googleId ?? null,
                    firstName: data.firstName.trim(),
                    lastName: data.lastName.trim(),
                    avatarUrl: data.avatarUrl ?? null,
                    isActive: true,
                    isVerify: data.isVerify ?? false,
                },
            });

            return UsersMapper.toGetUser(user);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(id: string, data: UpdateUser): Promise<GetUser> {
        try {
            const updatePayload: Record<string, unknown> = {};
            if (data.email !== undefined) updatePayload.email = data.email.toLowerCase().trim();
            if (data.firstName !== undefined) updatePayload.firstName = data.firstName.trim();
            if (data.lastName !== undefined) updatePayload.lastName = data.lastName.trim();
            if (data.avatarUrl !== undefined) updatePayload.avatarUrl = data.avatarUrl;
            if (data.passwordHash !== undefined) updatePayload.passwordHash = data.passwordHash;
            if (data.isVerify !== undefined) updatePayload.isVerify = data.isVerify;

            const updated = await this.prisma.user.update({
                where: { id },
                data: updatePayload,
            });

            return UsersMapper.toGetUser(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<GetUser | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
            });

            if (!user) return null;
            return UsersMapper.toGetUser(user);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByIdWithPassword(id: string): Promise<User | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
            });

            if (!user) return null;
            return UsersMapper.toDomain(user);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: email.toLowerCase().trim() },
            });

            if (!user) return null;
            return UsersMapper.toDomain(user);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findAll(): Promise<GetSimpleUser[]> {
        try {
            const users = await this.prisma.user.findMany({
                orderBy: { createdAt: "desc" },
            });

            return users.map((u) => UsersMapper.toGetSimpleUser(u));
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findAllPaginated(
        page: number,
        limit: number,
        filters?: { q?: string }
    ): Promise<{ data: GetSimpleUser[]; total: number }> {
        try {
            const skip = Math.max(0, (page - 1) * limit);
            const where: Record<string, unknown> = {};

            if (filters?.q && filters.q.trim()) {
                const term = filters.q.trim();
                where.OR = [
                    { email: { contains: term } },
                    { firstName: { contains: term } },
                    { lastName: { contains: term } },
                ];
            }

            const [total, users] = await Promise.all([
                this.prisma.user.count({ where }),
                this.prisma.user.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
            ]);

            return {
                data: users.map((u) => UsersMapper.toGetSimpleUser(u)),
                total,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async activate(id: string): Promise<GetUser> {
        try {
            const updated = await this.prisma.user.update({
                where: { id },
                data: { isActive: true },
            });
            return UsersMapper.toGetUser(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async disable(id: string): Promise<GetUser> {
        try {
            const updated = await this.prisma.user.update({
                where: { id },
                data: { isActive: false },
            });
            return UsersMapper.toGetUser(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async softDelete(id: string): Promise<GetUser> {
        try {
            const updated = await this.prisma.user.update({
                where: { id },
                data: { isActive: false },
            });
            return UsersMapper.toGetUser(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async updatePassword(id: string, passwordHash: string): Promise<void> {
        try {
            await this.prisma.user.update({
                where: { id },
                data: { passwordHash },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async updateVerification(id: string, isVerify: boolean): Promise<void> {
        try {
            await this.prisma.user.update({
                where: { id },
                data: { isVerify },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
