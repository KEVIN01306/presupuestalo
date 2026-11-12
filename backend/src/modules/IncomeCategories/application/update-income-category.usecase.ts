import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import { UniqueConstraintError } from "@shared/db/database/errors/UniqueConstraintError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { IncomeCategory, IncomeCategoryUpdateInput } from "../domain/income-category.entity.js";
import type { IncomeCategoriesRepository } from "../domain/income-categories.repository.js";

export class UpdateIncomeCategoryUseCase {
    constructor(
        private readonly repository: IncomeCategoriesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        id: string,
        teamId: string,
        data: IncomeCategoryUpdateInput,
        auditContext?: AuditContext
    ): Promise<IncomeCategory> {
        try {
            const existing = await this.repository.findById(id, teamId);
            if (!existing) {
                throw new AppError("Categoría de ingreso no encontrada", "DATA_NOT_FOUND", 404);
            }

            if (existing.isSystem) {
                throw new AppError(
                    "No se puede editar una categoría de sistema",
                    "SYSTEM_CATEGORY_PROTECTED",
                    403
                );
            }

            if (data.name !== existing.name) {
                const duplicate = await this.repository.findByName(data.name, teamId);
                if (duplicate && duplicate.id !== id) {
                    throw new AppError(
                        "Ya existe una categoría de ingreso con ese nombre en el equipo",
                        "DATA_ALREADY_EXISTS",
                        409
                    );
                }
            }

            const updated = await this.repository.update(id, teamId, data);

            await this.auditLogService.record({
                action: "UPDATE",
                resource: "income_category",
                resourceId: id,
                context: auditContext,
                before: existing,
                after: updated,
            });

            return updated;
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("Categoría de ingreso no encontrada", "DATA_NOT_FOUND", 404);
            }
            if (error instanceof UniqueConstraintError) {
                throw new AppError(
                    "Ya existe una categoría de ingreso con ese nombre en el equipo",
                    "DATA_ALREADY_EXISTS",
                    409
                );
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error al actualizar la categoría de ingreso", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
