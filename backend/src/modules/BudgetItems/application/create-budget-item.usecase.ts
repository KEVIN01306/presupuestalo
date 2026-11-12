import { Decimal } from "decimal.js";
import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { BudgetItem, BudgetItemCreateInput } from "../domain/budget-item.entity.js";
import type { BudgetItemsRepository } from "../domain/budget-items.repository.js";

export class CreateBudgetItemUseCase {
    constructor(
        private readonly repository: BudgetItemsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        budgetId: string,
        teamId: string,
        data: BudgetItemCreateInput,
        auditContext?: AuditContext
    ): Promise<BudgetItem> {
        try {
            const context = await this.repository.getBudgetCeilingContext(budgetId, teamId);
            if (!context) {
                throw new AppError("Presupuesto no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (context.status === "CLOSED") {
                throw new AppError(
                    "No se pueden crear rubros en un presupuesto cerrado",
                    "BUDGET_CLOSED",
                    400
                );
            }

            const projectedDec = new Decimal(data.projectedAmount);
            if (projectedDec.lte(0)) {
                throw new AppError("El monto proyectado debe ser mayor a 0", "INVALID_DATA", 400);
            }

            const totalIncomeDec = new Decimal(context.totalIncome);
            const existingProjectedDec = new Decimal(context.existingProjectedSum);
            const newTotalProjected = existingProjectedDec.plus(projectedDec);

            if (newTotalProjected.gt(totalIncomeDec)) {
                throw new AppError(
                    "El monto proyectado excede el techo presupuestario disponible (ingresos totales)",
                    "BUDGET_CEILING_EXCEEDED",
                    400
                );
            }

            if (data.hasUserSplit && data.allocations && data.allocations.length > 0) {
                const userIds = data.allocations.map((a) => a.userId);
                if (new Set(userIds).size !== userIds.length) {
                    throw new AppError(
                        "No puede haber usuarios duplicados en las asignaciones",
                        "DUPLICATE_ALLOCATION_USER",
                        400
                    );
                }

                const validMembers = await this.repository.areUsersTeamMembers(userIds, teamId);
                if (!validMembers) {
                    throw new AppError(
                        "Uno o más usuarios asignados no pertenecen a este equipo",
                        "INVALID_TEAM_MEMBER",
                        400
                    );
                }

                let allocationsSum = new Decimal(0);
                for (const allocation of data.allocations) {
                    const assignedDec = new Decimal(allocation.assignedAmount);
                    if (assignedDec.lt(0)) {
                        throw new AppError(
                            "El monto asignado a un usuario no puede ser negativo",
                            "INVALID_DATA",
                            400
                        );
                    }
                    allocationsSum = allocationsSum.plus(assignedDec);
                }

                if (allocationsSum.gt(projectedDec)) {
                    throw new AppError(
                        "La suma de las asignaciones por usuario excede el monto proyectado del rubro",
                        "ALLOCATIONS_EXCEED_PROJECTED",
                        400
                    );
                }
            }

            const created = await this.repository.create(budgetId, data);

            await this.auditLogService.record({
                action: "CREATE",
                resource: "budget_item",
                resourceId: created.id,
                context: auditContext,
                after: created,
            });

            return created;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al crear el rubro del presupuesto", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
