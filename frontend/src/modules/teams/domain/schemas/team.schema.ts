import { z } from 'zod';

export const teamFormSchema = z.object({
    name: z
        .string({ message: 'El nombre del equipo es obligatorio' })
        .trim()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    description: z
        .string()
        .trim()
        .max(500, 'La descripción no puede exceder 500 caracteres')
        .optional()
        .or(z.literal('')),
    currencyId: z
        .string()
        .uuid('Debe seleccionar una moneda válida')
        .optional()
        .or(z.literal('')),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;

export const addTeamMemberSchema = z.object({
    email: z
        .string({ message: 'El correo electrónico es obligatorio' })
        .trim()
        .email('Debe proporcionar un correo electrónico válido'),
    role: z.enum(['OWNER', 'EDITOR', 'VIEWER'], {
        message: 'El rol debe ser OWNER, EDITOR o VIEWER',
    }),
});

export type AddTeamMemberFormValues = z.infer<typeof addTeamMemberSchema>;

export const incomeCategorySchema = z.object({
    name: z
        .string({ message: 'El nombre de la categoría es obligatorio' })
        .trim()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
});

export type IncomeCategoryFormValues = z.infer<typeof incomeCategorySchema>;
