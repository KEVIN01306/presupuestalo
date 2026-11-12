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
import type { IncomeCategory, TeamMemberDetail } from '../../../teams/domain/interfaces/team.interface';
import type { Income } from '../../domain/interfaces/budget.interface';
import { incomeFormSchema, type IncomeFormValues } from '../../domain/schemas/budget.schema';

interface IncomeFormDialogProps {
    open: boolean;
    onClose: () => void;
    initialIncome?: Income | null;
    categories: IncomeCategory[];
    members: TeamMemberDetail[];
    defaultUserId: string;
    onSubmitValues: (values: IncomeFormValues, incomeId?: string) => Promise<void>;
}

export const IncomeFormDialog: React.FC<IncomeFormDialogProps> = ({
    open,
    onClose,
    initialIncome,
    categories,
    members,
    defaultUserId,
    onSubmitValues,
}) => {
    const [error, setError] = useState<string | null>(null);
    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<IncomeFormValues>({
        resolver: zodResolver(incomeFormSchema),
        defaultValues: { categoryId: '', userId: defaultUserId, amount: 0, description: '', date: '' },
    });

    useEffect(() => {
        if (open) {
            reset({
                categoryId: initialIncome?.categoryId ?? categories[0]?.id ?? '',
                userId: initialIncome?.userId ?? defaultUserId ?? members[0]?.userId ?? '',
                amount: initialIncome?.amount ?? 0,
                description: initialIncome?.description ?? '',
                date: initialIncome?.date ? initialIncome.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
            });
        }
    }, [open, initialIncome, categories, members, defaultUserId, reset]);

    const handleClose = () => {
        setError(null);
        onClose();
    };

    const onSubmit = async (values: IncomeFormValues) => {
        setError(null);
        try {
            await onSubmitValues(values, initialIncome?.id);
            handleClose();
        } catch (err) {
            const msg = axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined;
            setError(msg || 'No se pudo guardar el ingreso.');
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 500 }}>{initialIncome ? 'Editar ingreso' : 'Registrar ingreso'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogContent>
                    <Stack sx={{ gap: 2, pt: 0.5 }}>
                        {error && <Alert severity="error">{error}</Alert>}
                        <Controller name="categoryId" control={control} render={({ field }) => (
                            <TextField {...field} select label="Categoría" fullWidth error={!!errors.categoryId} helperText={errors.categoryId?.message}>
                                {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                            </TextField>
                        )} />
                        <Controller name="userId" control={control} render={({ field }) => (
                            <TextField {...field} select label="Miembro" fullWidth error={!!errors.userId} helperText={errors.userId?.message}>
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
