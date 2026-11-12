import { Decimal } from "decimal.js";
import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type {
    BudgetItem,
    BudgetItemAllocationInput,
    BudgetItemUpdateInput,
} from "../domain/budget-item.entity.js";
import type { BudgetItemsRepository } from "../domain/budget-items.repository.js";

export class UpdateBudgetItemUseCase {
    constructor(
        private readonly repository: BudgetItemsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        itemId: string,
        teamId: string,
        data: BudgetItemUpdateInput,
        auditContext?: AuditContext
    ): Promise<BudgetItem> {
        try {
            const context = await this.repository.findByIdForUpdate(itemId, teamId);
            if (!context) {
                throw new AppError("Rubro no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (context.budgetStatus === "CLOSED") {
                throw new AppError(
                    "No se pueden modificar rubros en un presupuesto cerrado",
                    "BUDGET_CLOSED",
                    400
                );
            }

            const oldProjectedDec = new Decimal(context.item.projectedAmount);
            const newProjectedDec =
                data.projectedAmount !== undefined
                    ? new Decimal(data.projectedAmount)
                    : oldProjectedDec;

            if (newProjectedDec.lte(0)) {
                throw new AppError("El monto proyectado debe ser mayor a 0", "INVALID_DATA", 400);
            }

            const totalIncomeDec = new Decimal(context.totalIncome);
            const existingProjectedSumDec = new Decimal(context.existingProjectedSum);
            const updatedProjectedSum = existingProjectedSumDec
                .minus(oldProjectedDec)
                .plus(newProjectedDec);

            if (updatedProjectedSum.gt(totalIncomeDec)) {
                throw new AppError(
                    "El monto proyectado excede el techo presupuestario disponible (ingresos totales)",
                    "BUDGET_CEILING_EXCEEDED",
                    400
                );
            }

            const totalSpentDec = new Decimal(context.totalSpentOnItem);
            if (newProjectedDec.lt(totalSpentDec)) {
                throw new AppError(
                    "El monto proyectado no puede ser menor al total ya gastado en este rubro",
                    "PROJECTED_BELOW_SPENT",
                    400
                );
            }

            const newHasUserSplit =
                data.hasUserSplit !== undefined ? data.hasUserSplit : context.item.hasUserSplit;

            let replaceAllocations = false;
            const updatePayload: BudgetItemUpdateInput = { ...data };

            if (newHasUserSplit) {
                const effectiveAllocations: BudgetItemAllocationInput[] =
                    data.allocations !== undefined
                        ? data.allocations
                        : context.item.allocations.map((a) => ({
                              userId: a.userId,
                              assignedAmount: a.assignedAmount,
                          }));

                const userIds = effectiveAllocations.map((a) => a.userId);
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
                for (const allocation of effectiveAllocations) {
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

                if (allocationsSum.gt(newProjectedDec)) {
                    throw new AppError(
                        "La suma de las asignaciones por usuario excede el monto proyectado del rubro",
                        "ALLOCATIONS_EXCEED_PROJECTED",
                        400
                    );
                }

                for (const [userId, spentStr] of Object.entries(context.spentByUser)) {
                    const userSpentDec = new Decimal(spentStr);
                    if (userSpentDec.gt(0)) {
                        const userAllocation = effectiveAllocations.find((a) => a.userId === userId);
                        if (!userAllocation || new Decimal(userAllocation.assignedAmount).lt(userSpentDec)) {
                            throw new AppError(
                                "El monto asignado a un usuario no puede ser menor a lo que ya gastó en este rubro",
                                "ALLOCATION_BELOW_SPENT",
                                400
                            );
                        }
                    }
                }

                replaceAllocations = data.allocations !== undefined;
            } else {
                // Cuando hasUserSplit es false, limpiar asignaciones previas si existían
                replaceAllocations = context.item.allocations.length > 0 || data.allocations !== undefined;
                updatePayload.allocations = [];
            }

            const updated = await this.repository.update(itemId, updatePayload, replaceAllocations);

            await this.auditLogService.record({
                action: "UPDATE",
                resource: "budget_item",
                resourceId: itemId,
                context: auditContext,
                before: context.item,
                after: updated,
            });

            return updated;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al actualizar el rubro del presupuesto", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
