import { z } from "zod";

export const budgetIdParamSchema = z.object({
    budgetId: z.string().uuid("El ID del presupuesto debe ser un UUID válido"),
});

export const itemIdParamSchema = z.object({
    itemId: z.string().uuid("El ID del rubro debe ser un UUID válido"),
});

const allocationSchema = z.object({
    userId: z
        .string({ message: "El usuario de la asignación es obligatorio" })
        .uuid("El ID del usuario debe ser un UUID válido"),
    assignedAmount: z.coerce
        .number({ message: "El monto asignado debe ser un número válido" })
        .finite("El monto asignado debe ser un número válido")
        .min(0, "El monto asignado no puede ser negativo"),
});

export const createBudgetItemSchema = z.object({
    name: z
        .string({ message: "El nombre del rubro es obligatorio" })
        .trim()
        .min(1, "El nombre del rubro es obligatorio")
        .max(150, "El nombre del rubro no puede exceder 150 caracteres"),
    projectedAmount: z.coerce
        .number({ message: "El monto proyectado es obligatorio" })
        .finite("El monto proyectado debe ser un número válido")
        .positive("El monto proyectado debe ser mayor a 0"),
    hasUserSplit: z.boolean().default(false),
    allocations: z.array(allocationSchema).optional(),
});

export const updateBudgetItemSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "El nombre del rubro no puede estar vacío")
        .max(150, "El nombre del rubro no puede exceder 150 caracteres")
        .optional(),
    projectedAmount: z.coerce
        .number({ message: "El monto proyectado debe ser un número válido" })
        .finite("El monto proyectado debe ser un número válido")
        .positive("El monto proyectado debe ser mayor a 0")
        .optional(),
    hasUserSplit: z.boolean().optional(),
    allocations: z.array(allocationSchema).optional(),
});
