import type { PrismaClient } from "@prisma/client";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";
import type {
    IncomeCategory,
    IncomeCategoryCreateInput,
    IncomeCategoryUpdateInput,
} from "../domain/income-category.entity.js";
import type { IncomeCategoriesRepository } from "../domain/income-categories.repository.js";
import { IncomeCategoryMapper } from "./mappers/income-category.mapper.js";

export class PrismaIncomeCategoriesRepository implements IncomeCategoriesRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async listByTeam(teamId: string): Promise<IncomeCategory[]> {
        try {
            const records = await this.prisma.incomeCategory.findMany({
                where: { teamId },
                orderBy: [{ isSystem: "asc" }, { name: "asc" }],
            });
            return records.map((r) => IncomeCategoryMapper.map(r));
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string, teamId: string): Promise<IncomeCategory | null> {
        try {
            const record = await this.prisma.incomeCategory.findFirst({
                where: { id, teamId },
            });
            return record ? IncomeCategoryMapper.map(record) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByName(name: string, teamId: string): Promise<IncomeCategory | null> {
        try {
            const record = await this.prisma.incomeCategory.findUnique({
                where: {
                    teamId_name: {
                        teamId,
                        name,
                    },
                },
            });
            return record ? IncomeCategoryMapper.map(record) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async create(teamId: string, data: IncomeCategoryCreateInput): Promise<IncomeCategory> {
        try {
            const created = await this.prisma.incomeCategory.create({
                data: {
                    teamId,
                    name: data.name,
                    isSystem: false,
                },
            });
            return IncomeCategoryMapper.map(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(id: string, teamId: string, data: IncomeCategoryUpdateInput): Promise<IncomeCategory> {
        try {
            const existing = await this.prisma.incomeCategory.findFirst({
                where: { id, teamId },
            });
            if (!existing) {
                throw new NotFoundPersistenceError();
            }

            const updated = await this.prisma.incomeCategory.update({
                where: { id },
                data: { name: data.name },
            });
            return IncomeCategoryMapper.map(updated);
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) throw error;
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(id: string, teamId: string): Promise<void> {
        try {
            const result = await this.prisma.incomeCategory.deleteMany({
                where: { id, teamId },
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
