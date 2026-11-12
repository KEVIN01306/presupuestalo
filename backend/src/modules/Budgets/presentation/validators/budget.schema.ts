import { z } from "zod";

export const teamBudgetParamSchema = z.object({
    teamId: z.string().uuid("El ID del equipo debe ser un UUID válido"),
});

export const budgetIdParamSchema = z.object({
    budgetId: z.string().uuid("El ID del presupuesto debe ser un UUID válido"),
});

export const createBudgetSchema = z
    .object({
        name: z
            .string({ message: "El nombre del presupuesto es obligatorio" })
            .trim()
            .min(2, "El nombre del presupuesto debe tener al menos 2 caracteres")
            .max(120, "El nombre del presupuesto no puede exceder 120 caracteres"),
        startDate: z.coerce.date({ message: "La fecha de inicio es obligatoria y debe ser válida" }),
        endDate: z.coerce.date({ message: "La fecha de fin es obligatoria y debe ser válida" }),
    })
    .refine((data) => data.endDate >= data.startDate, {
        message: "La fecha de fin debe ser igual o posterior a la fecha de inicio",
        path: ["endDate"],
    });

export const updateBudgetSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "El nombre del presupuesto debe tener al menos 2 caracteres")
            .max(120, "El nombre del presupuesto no puede exceder 120 caracteres")
            .optional(),
        startDate: z.coerce.date({ message: "La fecha de inicio debe ser válida" }).optional(),
        endDate: z.coerce.date({ message: "La fecha de fin debe ser válida" }).optional(),
    })
    .refine(
        (data) => {
            if (data.startDate && data.endDate) {
                return data.endDate >= data.startDate;
            }
            return true;
        },
        {
            message: "La fecha de fin debe ser igual o posterior a la fecha de inicio",
            path: ["endDate"],
        }
    );

export const closeBudgetSchema = z
    .object({
        savedAmount: z.coerce
            .number({ message: "El monto a ahorrar debe ser un número válido" })
            .min(0, "El monto a ahorrar no puede ser negativo")
            .default(0),
    })
    .default({ savedAmount: 0 });
