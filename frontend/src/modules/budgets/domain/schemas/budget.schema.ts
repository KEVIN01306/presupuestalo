import { z } from 'zod';

export const createBudgetSchema = z
    .object({
        name: z
            .string({ message: 'El nombre es obligatorio' })
            .trim()
            .min(2, 'El nombre debe tener al menos 2 caracteres')
            .max(120, 'El nombre no puede exceder 120 caracteres'),
        startDate: z.string({ message: 'La fecha de inicio es obligatoria' }).min(1, 'Fecha de inicio requerida'),
        endDate: z.string({ message: 'La fecha de fin es obligatoria' }).min(1, 'Fecha de fin requerida'),
    })
    .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
        message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
        path: ['endDate'],
    });

export type CreateBudgetFormValues = z.infer<typeof createBudgetSchema>;

export const incomeFormSchema = z.object({
    categoryId: z.string({ message: 'La categoría es obligatoria' }).uuid('Selecciona una categoría válida'),
    userId: z.string({ message: 'El miembro es obligatorio' }).uuid('Selecciona un miembro válido'),
    amount: z
        .number({ invalid_type_error: 'El monto debe ser un número' })
        .positive('El monto debe ser mayor a 0'),
    description: z.string().trim().max(300, 'Máximo 300 caracteres').optional().or(z.literal('')),
    date: z.string().min(1, 'La fecha es obligatoria'),
});

export type IncomeFormValues = z.infer<typeof incomeFormSchema>;

export const budgetItemAllocationSchema = z.object({
    userId: z.string().uuid('Usuario inválido'),
    assignedAmount: z.number({ invalid_type_error: 'Monto inválido' }).min(0, 'No puede ser negativo'),
});

export const budgetItemFormSchema = z.object({
    name: z
        .string({ message: 'El nombre del rubro es obligatorio' })
        .trim()
        .min(2, 'Mínimo 2 caracteres')
        .max(120, 'Máximo 120 caracteres'),
    projectedAmount: z
        .number({ invalid_type_error: 'El monto proyectado debe ser un número' })
        .positive('El monto proyectado debe ser mayor a 0'),
    hasUserSplit: z.boolean(),
    allocations: z.array(budgetItemAllocationSchema).optional(),
});

export type BudgetItemFormValues = z.infer<typeof budgetItemFormSchema>;

export const expenseFormSchema = z.object({
    budgetItemId: z.string({ message: 'El rubro es obligatorio' }).uuid('Selecciona un rubro válido'),
    paidByUserId: z.string().uuid('Selecciona un miembro válido'),
    amount: z
        .number({ invalid_type_error: 'El monto debe ser un número' })
        .positive('El monto debe ser mayor a 0'),
    date: z.string().min(1, 'La fecha es obligatoria'),
    description: z.string().trim().max(300, 'Máximo 300 caracteres').optional().or(z.literal('')),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export const closeBudgetSchema = z.object({
    savedAmount: z
        .number({ invalid_type_error: 'El monto de ahorro debe ser un número' })
        .min(0, 'El ahorro no puede ser negativo'),
});

export type CloseBudgetFormValues = z.infer<typeof closeBudgetSchema>;
