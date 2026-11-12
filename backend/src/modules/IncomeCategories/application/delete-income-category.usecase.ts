import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import { ForeignKeyConstraintError } from "@shared/db/database/errors/ForeignKeyConstraintError.js";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { IncomeCategoriesRepository } from "../domain/income-categories.repository.js";

export class DeleteIncomeCategoryUseCase {
    constructor(
        private readonly repository: IncomeCategoriesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(id: string, teamId: string, auditContext?: AuditContext): Promise<void> {
        try {
            const existing = await this.repository.findById(id, teamId);
            if (!existing) {
                throw new AppError("Categoría de ingreso no encontrada", "DATA_NOT_FOUND", 404);
            }

            if (existing.isSystem) {
                throw new AppError(
                    "No se puede eliminar una categoría de sistema",
                    "SYSTEM_CATEGORY_PROTECTED",
                    403
                );
            }

            await this.repository.delete(id, teamId);

            await this.auditLogService.record({
                action: "DELETE",
                resource: "income_category",
                resourceId: id,
                context: auditContext,
                before: existing,
            });
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("Categoría de ingreso no encontrada", "DATA_NOT_FOUND", 404);
            }
            if (error instanceof ForeignKeyConstraintError) {
                throw new AppError(
                    "No se puede eliminar la categoría porque tiene ingresos asociados",
                    "CATEGORY_IN_USE",
                    409
                );
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error al eliminar la categoría de ingreso", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
