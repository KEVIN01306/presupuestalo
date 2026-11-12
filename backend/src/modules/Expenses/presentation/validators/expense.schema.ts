import { z } from "zod";

export const budgetExpenseParamSchema = z.object({
    budgetId: z.string().uuid("El ID del presupuesto debe ser un UUID válido"),
});

export const expenseIdParamSchema = z.object({
    expenseId: z.string().uuid("El ID del gasto debe ser un UUID válido"),
});

export const listExpensesQuerySchema = z.object({
    budgetItemId: z.string().uuid("El ID del rubro debe ser un UUID válido").optional(),
    paidByUserId: z.string().uuid("El ID del usuario debe ser un UUID válido").optional(),
});

export const createExpenseSchema = z.object({
    budgetItemId: z
        .string({ message: "El rubro es obligatorio" })
        .uuid("El ID del rubro debe ser un UUID válido"),
    paidByUserId: z
        .string()
        .uuid("El ID del usuario pagador debe ser un UUID válido")
        .optional(),
    amount: z.coerce
        .number({ message: "El monto es obligatorio" })
        .finite("El monto debe ser un número válido")
        .positive("El monto debe ser mayor a 0"),
    date: z.coerce.date({ message: "La fecha debe ser válida" }).optional(),
    description: z
        .string()
        .trim()
        .max(500, "La descripción no puede exceder 500 caracteres")
        .nullable()
        .optional(),
});

export const updateExpenseSchema = z.object({
    budgetItemId: z
        .string()
        .uuid("El ID del rubro debe ser un UUID válido")
        .optional(),
    paidByUserId: z
        .string()
        .uuid("El ID del usuario pagador debe ser un UUID válido")
        .optional(),
    amount: z.coerce
        .number({ message: "El monto debe ser un número válido" })
        .finite("El monto debe ser un número válido")
        .positive("El monto debe ser mayor a 0")
        .optional(),
    date: z.coerce.date({ message: "La fecha debe ser válida" }).optional(),
    description: z
        .string()
        .trim()
        .max(500, "La descripción no puede exceder 500 caracteres")
        .nullable()
        .optional(),
});
