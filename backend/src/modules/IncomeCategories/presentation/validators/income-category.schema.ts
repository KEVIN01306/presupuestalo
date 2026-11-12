import { z } from "zod";

export const teamCategoryParamSchema = z.object({
    teamId: z.string().uuid("El ID del equipo debe ser un UUID válido"),
});

export const categoryIdParamSchema = z.object({
    teamId: z.string().uuid("El ID del equipo debe ser un UUID válido"),
    categoryId: z.string().uuid("El ID de la categoría debe ser un UUID válido"),
});

export const createIncomeCategorySchema = z.object({
    name: z
        .string({ message: "El nombre de la categoría es obligatorio" })
        .trim()
        .min(2, "El nombre de la categoría debe tener al menos 2 caracteres")
        .max(100, "El nombre de la categoría no puede exceder 100 caracteres"),
});

export const updateIncomeCategorySchema = z.object({
    name: z
        .string({ message: "El nombre de la categoría es obligatorio" })
        .trim()
        .min(2, "El nombre de la categoría debe tener al menos 2 caracteres")
        .max(100, "El nombre de la categoría no puede exceder 100 caracteres"),
});
