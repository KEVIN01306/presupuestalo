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
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import { createBudgetSchema, type CreateBudgetFormValues } from '../../domain/schemas/budget.schema';

interface CreateBudgetDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmitValues: (values: CreateBudgetFormValues) => Promise<void>;
}

const getMonthRange = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0));
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const label = start.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    return {
        name: `Presupuesto ${label.charAt(0).toUpperCase() + label.slice(1)}`,
        startDate: fmt(start),
        endDate: fmt(end),
    };
};

export const CreateBudgetDialog: React.FC<CreateBudgetDialogProps> = ({ open, onClose, onSubmitValues }) => {
    const [mode, setMode] = useState<'monthly' | 'custom'>('monthly');
    const [monthInput, setMonthInput] = useState(() => new Date().toISOString().slice(0, 7));
    const [error, setError] = useState<string | null>(null);

    const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
        useForm<CreateBudgetFormValues>({
            resolver: zodResolver(createBudgetSchema),
            defaultValues: getMonthRange(new Date().toISOString().slice(0, 7)),
        });

    useEffect(() => {
        if (open) {
            const currentMonth = new Date().toISOString().slice(0, 7);
            reset(getMonthRange(currentMonth));
        }
    }, [open, reset]);

    const handleClose = () => {
        setMode('monthly');
        setMonthInput(new Date().toISOString().slice(0, 7));
        setError(null);
        onClose();
    };

    const handleMonthChange = (val: string) => {
        setMonthInput(val);
        if (/^\d{4}-\d{2}$/.test(val)) {
            const range = getMonthRange(val);
            setValue('name', range.name, { shouldValidate: true });
            setValue('startDate', range.startDate, { shouldValidate: true });
            setValue('endDate', range.endDate, { shouldValidate: true });
        }
    };

    const onSubmit = async (values: CreateBudgetFormValues) => {
        setError(null);
        try {
            await onSubmitValues(values);
            handleClose();
        } catch (err) {
            const msg = axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined;
            setError(msg || 'No se pudo crear el presupuesto.');
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 500, color: '#202124' }}>Nuevo presupuesto</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogContent>
                    <Stack sx={{ gap: 2, pt: 0.5 }}>
                        {error && <Alert severity="error">{error}</Alert>}
                        <ToggleButtonGroup
                            exclusive
                            fullWidth
                            size="small"
                            value={mode}
                            onChange={(_, val) => val && setMode(val)}
                        >
                            <ToggleButton value="monthly">Mensual</ToggleButton>
                            <ToggleButton value="custom">Rango personalizado</ToggleButton>
                        </ToggleButtonGroup>
                        {mode === 'monthly' && (
                            <TextField
                                label="Seleccionar mes"
                                type="month"
                                value={monthInput}
                                onChange={(e) => handleMonthChange(e.target.value)}
                                slotProps={{ inputLabel: { shrink: true } }}
                                fullWidth
                            />
                        )}
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Nombre" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                            )}
                        />
                        <Controller
                            name="startDate"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Fecha de inicio" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} error={!!errors.startDate} helperText={errors.startDate?.message} />
                            )}
                        />
                        <Controller
                            name="endDate"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Fecha de fin" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} error={!!errors.endDate} helperText={errors.endDate?.message} />
                            )}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button variant="text" onClick={handleClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ borderRadius: '200px', px: 3 }}>
                        {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Crear'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
