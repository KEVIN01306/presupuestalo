import { Decimal } from "decimal.js";
import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { Expense, ExpenseUpdateInput } from "../domain/expense.entity.js";
import type { ExpensesRepository } from "../domain/expenses.repository.js";
import { validateExpenseLimit } from "./validate-expense-limit.helper.js";

export class UpdateExpenseUseCase {
    constructor(
        private readonly repository: ExpensesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        expenseId: string,
        teamId: string,
        data: ExpenseUpdateInput,
        auditContext?: AuditContext
    ): Promise<Expense> {
        try {
            const existingContext = await this.repository.findByIdWithContext(expenseId, teamId);
            if (!existingContext) {
                throw new AppError("Gasto no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (existingContext.budgetStatus === "CLOSED") {
                throw new AppError(
                    "No se pueden modificar gastos en un presupuesto cerrado",
                    "BUDGET_CLOSED",
                    400
                );
            }

            const targetBudgetItemId = data.budgetItemId ?? existingContext.expense.budgetItemId;
            const targetPaidByUserId = data.paidByUserId ?? existingContext.expense.paidByUserId;
            const targetAmountDec =
                data.amount !== undefined
                    ? new Decimal(data.amount)
                    : new Decimal(existingContext.expense.amount);

            if (targetAmountDec.lte(0)) {
                throw new AppError("El monto del gasto debe ser mayor a 0", "INVALID_DATA", 400);
            }

            const [isMember, itemContext] = await Promise.all([
                this.repository.userBelongsToTeam(targetPaidByUserId, teamId),
                this.repository.getBudgetItemLimitContext(
                    targetBudgetItemId,
                    existingContext.budgetId,
                    teamId,
                    targetPaidByUserId,
                    expenseId
                ),
            ]);

            if (!isMember) {
                throw new AppError(
                    "El usuario pagador no es miembro de este equipo",
                    "INVALID_TEAM_MEMBER",
                    400
                );
            }
            if (!itemContext) {
                throw new AppError(
                    "El rubro seleccionado no pertenece a este presupuesto",
                    "INVALID_BUDGET_ITEM",
                    400
                );
            }

            validateExpenseLimit(itemContext, targetAmountDec);

            const updated = await this.repository.update(expenseId, data);

            await this.auditLogService.record({
                action: "UPDATE",
                resource: "expense",
                resourceId: expenseId,
                context: auditContext,
                before: existingContext.expense,
                after: updated,
            });

            return updated;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al actualizar el gasto", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
