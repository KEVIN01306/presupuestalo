import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import { UniqueConstraintError } from "@shared/db/database/errors/UniqueConstraintError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { IncomeCategory, IncomeCategoryCreateInput } from "../domain/income-category.entity.js";
import type { IncomeCategoriesRepository } from "../domain/income-categories.repository.js";

export class CreateIncomeCategoryUseCase {
    constructor(
        private readonly repository: IncomeCategoriesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        teamId: string,
        data: IncomeCategoryCreateInput,
        auditContext?: AuditContext
    ): Promise<IncomeCategory> {
        try {
            const existing = await this.repository.findByName(data.name, teamId);
            if (existing) {
                throw new AppError(
                    "Ya existe una categoría de ingreso con ese nombre en el equipo",
                    "DATA_ALREADY_EXISTS",
                    409
                );
            }

            const created = await this.repository.create(teamId, data);

            await this.auditLogService.record({
                action: "CREATE",
                resource: "income_category",
                resourceId: created.id,
                context: auditContext,
                after: created,
            });

            return created;
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError(
                    "Ya existe una categoría de ingreso con ese nombre en el equipo",
                    "DATA_ALREADY_EXISTS",
                    409
                );
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error al crear la categoría de ingreso", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
