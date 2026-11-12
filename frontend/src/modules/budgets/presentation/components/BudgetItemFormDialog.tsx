import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import { formatMoney } from '../../../../core/utils/formatMoney';
import type { TeamMemberDetail } from '../../../teams/domain/interfaces/team.interface';
import type { BudgetItem } from '../../domain/interfaces/budget.interface';
import { budgetItemFormSchema, type BudgetItemFormValues } from '../../domain/schemas/budget.schema';

interface BudgetItemFormDialogProps {
    open: boolean;
    onClose: () => void;
    initialItem?: BudgetItem | null;
    members: TeamMemberDetail[];
    onSubmitValues: (values: BudgetItemFormValues, itemId?: string) => Promise<void>;
}

export const BudgetItemFormDialog: React.FC<BudgetItemFormDialogProps> = ({
    open,
    onClose,
    initialItem,
    members,
    onSubmitValues,
}) => {
    const [error, setError] = useState<string | null>(null);
    const [allocMap, setAllocMap] = useState<Record<string, number>>({});
    const showSplitOption = members.length >= 2;

    const { control, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
        useForm<BudgetItemFormValues>({
            resolver: zodResolver(budgetItemFormSchema),
            defaultValues: { name: '', projectedAmount: 0, hasUserSplit: false, allocations: [] },
        });

    const hasUserSplit = watch('hasUserSplit');
    const projectedAmount = watch('projectedAmount') || 0;

    useEffect(() => {
        if (open) {
            const initialSplit = showSplitOption ? Boolean(initialItem?.hasUserSplit) : false;
            const nextMap: Record<string, number> = {};
            members.forEach((m) => {
                const existing = initialItem?.allocations.find((a) => a.userId === m.userId);
                nextMap[m.userId] = existing ? existing.assignedAmount : 0;
            });
            setAllocMap(nextMap);
            reset({
                name: initialItem?.name ?? '',
                projectedAmount: initialItem?.projectedAmount ?? 0,
                hasUserSplit: initialSplit,
                allocations: [],
            });
            setError(null);
        }
    }, [open, initialItem, members, showSplitOption, reset]);

    const allocatedSum = Object.values(allocMap).reduce((acc, v) => acc + (Number(v) || 0), 0);

    const onSubmit = async (values: BudgetItemFormValues) => {
        setError(null);
        const finalSplit = showSplitOption && values.hasUserSplit;
        const payload: BudgetItemFormValues = {
            ...values,
            hasUserSplit: finalSplit,
            allocations: finalSplit
                ? members.map((m) => ({ userId: m.userId, assignedAmount: Number(allocMap[m.userId]) || 0 }))
                : undefined,
        };
        try {
            await onSubmitValues(payload, initialItem?.id);
            onClose();
        } catch (err) {
            const msg = axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined;
            setError(msg || 'No se pudo guardar el rubro.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 500 }}>{initialItem ? 'Editar rubro' : 'Nuevo rubro proyectado'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogContent>
                    <Stack sx={{ gap: 2, pt: 0.5 }}>
                        {error && <Alert severity="error">{error}</Alert>}
                        <Controller name="name" control={control} render={({ field }) => (
                            <TextField {...field} label="Nombre del rubro" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                        )} />
                        <Controller name="projectedAmount" control={control} render={({ field }) => (
                            <TextField {...field} label="Monto proyectado" type="number" fullWidth onChange={(e) => field.onChange(Number(e.target.value))} error={!!errors.projectedAmount} helperText={errors.projectedAmount?.message} />
                        )} />
                        {showSplitOption && (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={hasUserSplit}
                                        onChange={(e) => setValue('hasUserSplit', e.target.checked)}
                                    />
                                }
                                label="Dividir asignación por miembro"
                            />
                        )}
                        {showSplitOption && hasUserSplit && (
                            <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#f8f9fa', border: '1px solid #dadce0' }}>
                                <Typography variant="caption" sx={{ color: '#5f6368', display: 'block', mb: 1.5 }}>
                                    Asignado: {formatMoney(allocatedSum)} / {formatMoney(projectedAmount)}
                                </Typography>
                                <Stack sx={{ gap: 1.5 }}>
                                    {members.map((m) => (
                                        <TextField
                                            key={m.userId}
                                            size="small"
                                            type="number"
                                            label={`${m.user.firstName} ${m.user.lastName}`}
                                            value={allocMap[m.userId] ?? 0}
                                            onChange={(e) => setAllocMap((prev) => ({ ...prev, [m.userId]: Number(e.target.value) }))}
                                            fullWidth
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button variant="text" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ borderRadius: '200px', px: 3 }}>
                        {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Guardar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
