import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { BudgetItemsRepository } from "../domain/budget-items.repository.js";

export class DeleteBudgetItemUseCase {
    constructor(
        private readonly repository: BudgetItemsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(itemId: string, teamId: string, auditContext?: AuditContext): Promise<void> {
        try {
            const context = await this.repository.findByIdForDelete(itemId, teamId);
            if (!context) {
                throw new AppError("Rubro no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (context.budgetStatus === "CLOSED") {
                throw new AppError(
                    "No se pueden eliminar rubros en un presupuesto cerrado",
                    "BUDGET_CLOSED",
                    400
                );
            }
            if (context.expensesCount > 0) {
                throw new AppError(
                    "No se puede eliminar el rubro porque ya tiene gastos registrados",
                    "ITEM_HAS_EXPENSES",
                    409
                );
            }

            await this.repository.delete(itemId);

            await this.auditLogService.record({
                action: "DELETE",
                resource: "budget_item",
                resourceId: itemId,
                context: auditContext,
                before: context.item,
            });
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("Rubro no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error al eliminar el rubro del presupuesto", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
