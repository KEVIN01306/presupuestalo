import { z } from "zod";

export const teamIdParamSchema = z.object({
    teamId: z.string().uuid("El ID del equipo debe ser un UUID válido"),
});

export const teamMemberParamSchema = z.object({
    teamId: z.string().uuid("El ID del equipo debe ser un UUID válido"),
    memberId: z.string().uuid("El ID del miembro debe ser un UUID válido"),
});

export const createTeamSchema = z.object({
    name: z
        .string({ message: "El nombre del equipo es obligatorio" })
        .trim()
        .min(2, "El nombre del equipo debe tener al menos 2 caracteres")
        .max(100, "El nombre del equipo no puede exceder 100 caracteres"),
    description: z
        .string()
        .trim()
        .max(500, "La descripción no puede exceder 500 caracteres")
        .nullable()
        .optional(),
    currencyId: z
        .string()
        .uuid("El ID de la moneda debe ser un UUID válido")
        .optional(),
});

export const updateTeamSchema = createTeamSchema.partial();

export const addTeamMemberSchema = z.object({
    email: z
        .string({ message: "El correo electrónico es obligatorio" })
        .trim()
        .email("Debe proporcionar un correo electrónico válido"),
    role: z
        .enum(["OWNER", "EDITOR", "VIEWER"], {
            message: "El rol debe ser OWNER, EDITOR o VIEWER",
        })
        .optional()
        .default("VIEWER"),
});

export const updateTeamMemberRoleSchema = z.object({
    role: z.enum(["OWNER", "EDITOR", "VIEWER"], {
        message: "El rol debe ser OWNER, EDITOR o VIEWER",
    }),
});
