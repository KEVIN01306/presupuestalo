import { Decimal } from "decimal.js";
import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { Expense, ExpenseCreateInput } from "../domain/expense.entity.js";
import type { ExpensesRepository } from "../domain/expenses.repository.js";
import { validateExpenseLimit } from "./validate-expense-limit.helper.js";

export class CreateExpenseUseCase {
    constructor(
        private readonly repository: ExpensesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        budgetId: string,
        teamId: string,
        currentUserId: string,
        data: ExpenseCreateInput,
        auditContext?: AuditContext
    ): Promise<Expense> {
        try {
            const budgetStatus = await this.repository.findBudgetStatus(budgetId, teamId);
            if (!budgetStatus) {
                throw new AppError("Presupuesto no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (budgetStatus === "CLOSED") {
                throw new AppError(
                    "No se pueden registrar gastos en un presupuesto cerrado",
                    "BUDGET_CLOSED",
                    400
                );
            }

            const paidByUserId = data.paidByUserId ?? currentUserId;
            const amountDec = new Decimal(data.amount);
            if (amountDec.lte(0)) {
                throw new AppError("El monto del gasto debe ser mayor a 0", "INVALID_DATA", 400);
            }

            const [isMember, itemContext] = await Promise.all([
                this.repository.userBelongsToTeam(paidByUserId, teamId),
                this.repository.getBudgetItemLimitContext(
                    data.budgetItemId,
                    budgetId,
                    teamId,
                    paidByUserId
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

            validateExpenseLimit(itemContext, amountDec);

            const created = await this.repository.create({
                budgetItemId: data.budgetItemId,
                paidByUserId,
                createdByUserId: currentUserId,
                amount: amountDec.toDecimalPlaces(2).toNumber(),
                date: data.date ?? new Date(),
                description: data.description ?? null,
            });

            await this.auditLogService.record({
                action: "CREATE",
                resource: "expense",
                resourceId: created.id,
                context: auditContext,
                after: created,
            });

            return created;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al registrar el gasto", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
