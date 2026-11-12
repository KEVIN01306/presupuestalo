import { Decimal } from "decimal.js";
import AppError from "@shared/errors/AppError.js";
import type { ExpenseBudgetItemLimitContext } from "../domain/expense.entity.js";

/**
 * Valida las reglas de bloqueo al registrar o actualizar un gasto contra un rubro.
 * - Si hasUserSplit === true: el pagador debe tener asignación > 0 y (gastado + nuevo) <= asignación.
 * - Si hasUserSplit === false: (total gastado en el rubro + nuevo) <= projectedAmount.
 */
export function validateExpenseLimit(
    context: ExpenseBudgetItemLimitContext,
    newAmount: Decimal
): void {
    if (context.hasUserSplit) {
        if (
            context.userAllocationAmount === null ||
            new Decimal(context.userAllocationAmount).lte(0)
        ) {
            throw new AppError(
                "El usuario no tiene un monto asignado en este rubro",
                "NO_USER_ALLOCATION",
                400
            );
        }

        const assignedDec = new Decimal(context.userAllocationAmount);
        const userSpentDec = new Decimal(context.userSpentExcluding);
        if (userSpentDec.plus(newAmount).gt(assignedDec)) {
            throw new AppError(
                "El gasto excede tu monto asignado en este rubro",
                "ALLOCATION_EXCEEDED",
                400
            );
        }
        return;
    }

    const projectedDec = new Decimal(context.projectedAmount);
    const totalSpentDec = new Decimal(context.totalSpentExcluding);
    if (totalSpentDec.plus(newAmount).gt(projectedDec)) {
        throw new AppError(
            "El gasto excede el monto proyectado del rubro",
            "PROJECTED_AMOUNT_EXCEEDED",
            400
        );
    }
}
