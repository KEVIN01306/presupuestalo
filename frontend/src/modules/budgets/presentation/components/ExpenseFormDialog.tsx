import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';
import type { TeamMemberDetail } from '../../../teams/domain/interfaces/team.interface';
import type { BudgetItem, Expense } from '../../domain/interfaces/budget.interface';
import { expenseFormSchema, type ExpenseFormValues } from '../../domain/schemas/budget.schema';

interface ExpenseFormDialogProps {
    open: boolean;
    onClose: () => void;
    initialExpense?: Expense | null;
    items: BudgetItem[];
    members: TeamMemberDetail[];
    defaultUserId: string;
    onSubmitValues: (values: ExpenseFormValues, expenseId?: string) => Promise<void>;
}

export const ExpenseFormDialog: React.FC<ExpenseFormDialogProps> = ({
    open,
    onClose,
    initialExpense,
    items,
    members,
    defaultUserId,
    onSubmitValues,
}) => {
    const [error, setError] = useState<string | null>(null);
    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseFormSchema),
        defaultValues: { budgetItemId: '', paidByUserId: defaultUserId, amount: 0, date: '', description: '' },
    });

    useEffect(() => {
        if (open) {
            reset({
                budgetItemId: initialExpense?.budgetItemId ?? items[0]?.id ?? '',
                paidByUserId: initialExpense?.paidByUserId ?? defaultUserId ?? members[0]?.userId ?? '',
                amount: initialExpense?.amount ?? 0,
                date: initialExpense?.date ? initialExpense.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
                description: initialExpense?.description ?? '',
            });
        }
    }, [open, initialExpense, items, members, defaultUserId, reset]);

    const handleClose = () => {
        setError(null);
        onClose();
    };

    const onSubmit = async (values: ExpenseFormValues) => {
        setError(null);
        try {
            await onSubmitValues(values, initialExpense?.id);
            handleClose();
        } catch (err) {
            const msg = axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined;
            setError(msg || 'No se pudo guardar el gasto.');
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 500 }}>{initialExpense ? 'Editar gasto' : 'Registrar gasto real'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogContent>
                    <Stack sx={{ gap: 2, pt: 0.5 }}>
                        {error && <Alert severity="error">{error}</Alert>}
                        <Controller name="budgetItemId" control={control} render={({ field }) => (
                            <TextField {...field} select label="Rubro" fullWidth error={!!errors.budgetItemId} helperText={errors.budgetItemId?.message}>
                                {items.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
                            </TextField>
                        )} />
                        <Controller name="paidByUserId" control={control} render={({ field }) => (
                            <TextField {...field} select label="Pagado por" fullWidth error={!!errors.paidByUserId} helperText={errors.paidByUserId?.message}>
                                {members.map((m) => (
                                    <MenuItem key={m.userId} value={m.userId}>{m.user.firstName} {m.user.lastName}</MenuItem>
                                ))}
                            </TextField>
                        )} />
                        <Controller name="amount" control={control} render={({ field }) => (
                            <TextField {...field} label="Monto" type="number" fullWidth onChange={(e) => field.onChange(Number(e.target.value))} error={!!errors.amount} helperText={errors.amount?.message} />
                        )} />
                        <Controller name="date" control={control} render={({ field }) => (
                            <TextField {...field} label="Fecha" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} error={!!errors.date} helperText={errors.date?.message} />
                        )} />
                        <Controller name="description" control={control} render={({ field }) => (
                            <TextField {...field} label="Descripción (opcional)" fullWidth error={!!errors.description} helperText={errors.description?.message} />
                        )} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button variant="text" onClick={handleClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ borderRadius: '200px', px: 3 }}>
                        {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Guardar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
