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
import { teamFormSchema, type TeamFormValues } from '../../domain/schemas/team.schema';
import type { CurrencyItem, TeamDetail } from '../../domain/interfaces/team.interface';

interface TeamFormDialogProps {
    open: boolean;
    onClose: () => void;
    initialTeam?: TeamDetail | null;
    currencies: CurrencyItem[];
    onSubmitValues: (values: TeamFormValues) => Promise<void>;
}

export const TeamFormDialog: React.FC<TeamFormDialogProps> = ({
    open,
    onClose,
    initialTeam,
    currencies,
    onSubmitValues,
}) => {
    const [error, setError] = useState<string | null>(null);
    const isEdit = Boolean(initialTeam);
    const defaultCurrencyId = currencies.find((c) => c.code === 'USD')?.id ?? currencies[0]?.id ?? '';

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TeamFormValues>({
        resolver: zodResolver(teamFormSchema),
        defaultValues: { name: '', description: '', currencyId: defaultCurrencyId },
    });

    useEffect(() => {
        if (open) {
            reset({
                name: initialTeam?.name ?? '',
                description: initialTeam?.description ?? '',
                currencyId: initialTeam?.currencyId ?? initialTeam?.currency?.id ?? defaultCurrencyId,
            });
            setError(null);
        }
    }, [open, initialTeam, defaultCurrencyId, reset]);

    const onSubmit = async (values: TeamFormValues) => {
        setError(null);
        try {
            await onSubmitValues(values);
            onClose();
        } catch (err) {
            const msg = axios.isAxiosError(err)
                ? (err.response?.data as { message?: string } | undefined)?.message
                : undefined;
            setError(msg || 'No se pudo guardar el equipo.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{isEdit ? 'Editar equipo' : 'Crear equipo compartido'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogContent>
                    <Stack sx={{ gap: 2, pt: 1 }}>
                        {error && <Alert severity="error">{error}</Alert>}
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Nombre del equipo"
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                />
                            )}
                        />
                        <Controller
                            name="currencyId"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Moneda"
                                    fullWidth
                                    error={!!errors.currencyId}
                                    helperText={errors.currencyId?.message}
                                >
                                    {currencies.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>
                                            {c.code} ({c.symbol}) - {c.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Descripción (opcional)"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    error={!!errors.description}
                                    helperText={errors.description?.message}
                                />
                            )}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button variant="text" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={18} color="inherit" /> : isEdit ? 'Guardar' : 'Crear'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
