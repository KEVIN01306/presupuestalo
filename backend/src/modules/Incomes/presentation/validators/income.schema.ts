import { z } from "zod";

export const budgetIncomeParamSchema = z.object({
    budgetId: z.string().uuid("El ID del presupuesto debe ser un UUID válido"),
});

export const incomeIdParamSchema = z.object({
    incomeId: z.string().uuid("El ID del ingreso debe ser un UUID válido"),
});

export const createIncomeSchema = z.object({
    categoryId: z
        .string({ message: "La categoría es obligatoria" })
        .uuid("El ID de la categoría debe ser un UUID válido"),
    userId: z
        .string({ message: "El miembro del equipo es obligatorio" })
        .uuid("El ID del usuario debe ser un UUID válido"),
    amount: z.coerce
        .number({ message: "El monto es obligatorio" })
        .finite("El monto debe ser un número válido")
        .positive("El monto debe ser mayor a 0"),
    description: z
        .string()
        .trim()
        .max(255, "La descripción no puede exceder 255 caracteres")
        .nullable()
        .optional(),
    date: z.coerce.date({ message: "La fecha debe ser válida" }).optional(),
});

export const updateIncomeSchema = z.object({
    categoryId: z
        .string()
        .uuid("El ID de la categoría debe ser un UUID válido")
        .optional(),
    userId: z
        .string()
        .uuid("El ID del usuario debe ser un UUID válido")
        .optional(),
    amount: z.coerce
        .number({ message: "El monto debe ser un número válido" })
        .finite("El monto debe ser un número válido")
        .positive("El monto debe ser mayor a 0")
        .optional(),
    description: z
        .string()
        .trim()
        .max(255, "La descripción no puede exceder 255 caracteres")
        .nullable()
        .optional(),
    date: z.coerce.date({ message: "La fecha debe ser válida" }).optional(),
});
