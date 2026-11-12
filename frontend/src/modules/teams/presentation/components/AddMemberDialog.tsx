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
import {
    addTeamMemberSchema,
    type AddTeamMemberFormValues,
} from '../../domain/schemas/team.schema';

interface AddMemberDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmitValues: (values: AddTeamMemberFormValues) => Promise<void>;
}

export const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
    open,
    onClose,
    onSubmitValues,
}) => {
    const [error, setError] = useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddTeamMemberFormValues>({
        resolver: zodResolver(addTeamMemberSchema),
        defaultValues: { email: '', role: 'VIEWER' },
    });

    useEffect(() => {
        if (open) {
            reset({ email: '', role: 'VIEWER' });
            setError(null);
        }
    }, [open, reset]);

    const onSubmit = async (values: AddTeamMemberFormValues) => {
        setError(null);
        try {
            await onSubmitValues(values);
            onClose();
        } catch (err) {
            const msg = axios.isAxiosError(err)
                ? (err.response?.data as { message?: string } | undefined)?.message
                : undefined;
            setError(msg || 'No se pudo agregar el miembro.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Invitar miembro al equipo</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogContent>
                    <Stack sx={{ gap: 2, pt: 1 }}>
                        {error && <Alert severity="error">{error}</Alert>}
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Correo electrónico"
                                    type="email"
                                    fullWidth
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                />
                            )}
                        />
                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Rol"
                                    fullWidth
                                    error={!!errors.role}
                                    helperText={errors.role?.message}
                                >
                                    <MenuItem value="OWNER">Propietario (OWNER)</MenuItem>
                                    <MenuItem value="EDITOR">Editor (EDITOR)</MenuItem>
                                    <MenuItem value="VIEWER">Lector (VIEWER)</MenuItem>
                                </TextField>
                            )}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button variant="text" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Agregar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
