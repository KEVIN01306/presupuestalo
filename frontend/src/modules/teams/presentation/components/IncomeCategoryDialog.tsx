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
} from '@mui/material';
import {
    incomeCategorySchema,
    type IncomeCategoryFormValues,
} from '../../domain/schemas/team.schema';
import type { IncomeCategory } from '../../domain/interfaces/team.interface';

interface IncomeCategoryDialogProps {
    open: boolean;
    onClose: () => void;
    initialCategory?: IncomeCategory | null;
    onSubmitValues: (values: IncomeCategoryFormValues) => Promise<void>;
}

export const IncomeCategoryDialog: React.FC<IncomeCategoryDialogProps> = ({
    open,
    onClose,
    initialCategory,
    onSubmitValues,
}) => {
    const [error, setError] = useState<string | null>(null);
    const isEdit = Boolean(initialCategory);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<IncomeCategoryFormValues>({
        resolver: zodResolver(incomeCategorySchema),
        defaultValues: { name: '' },
    });

    useEffect(() => {
        if (open) {
            reset({ name: initialCategory?.name ?? '' });
            setError(null);
        }
    }, [open, initialCategory, reset]);

    const onSubmit = async (values: IncomeCategoryFormValues) => {
        setError(null);
        try {
            await onSubmitValues(values);
            onClose();
        } catch (err) {
            const msg = axios.isAxiosError(err)
                ? (err.response?.data as { message?: string } | undefined)?.message
                : undefined;
            setError(msg || 'No se pudo guardar la categoría.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{isEdit ? 'Editar categoría de ingreso' : 'Nueva categoría de ingreso'}</DialogTitle>
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
                                    label="Nombre de la categoría"
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
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
