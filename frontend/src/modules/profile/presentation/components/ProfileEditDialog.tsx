import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    Alert,
    CircularProgress,
} from '@mui/material';
import { updateProfileSchema, type UpdateProfileFormValues } from '../../domain/schemas/profile.schemas';
import { updateProfile } from '../../infrastructure/services/profile.service';
import type { AuthUser } from '../../../auth/domain/interfaces/auth.interfaces';

interface ProfileEditDialogProps {
    open: boolean;
    onClose: () => void;
    user: AuthUser | null;
    onSuccess: (updated: AuthUser) => void;
}

export const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({
    open,
    onClose,
    user,
    onSuccess,
}) => {
    const [error, setError] = useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UpdateProfileFormValues>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            avatarUrl: user?.avatarUrl ?? '',
        },
    });

    useEffect(() => {
        if (open && user) {
            reset({
                firstName: user.firstName,
                lastName: user.lastName,
                avatarUrl: user.avatarUrl ?? '',
            });
            setError(null);
        }
    }, [open, user, reset]);

    const onSubmit = async (values: UpdateProfileFormValues) => {
        setError(null);
        try {
            const updated = await updateProfile(values);
            onSuccess(updated);
            onClose();
        } catch {
            setError('No se pudo actualizar el perfil. Intenta de nuevo.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Editar perfil</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogContent>
                    <Stack sx={{ gap: 2, pt: 1 }}>
                        {error && <Alert severity="error">{error}</Alert>}
                        <Controller
                            name="firstName"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Nombre" fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} />
                            )}
                        />
                        <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Apellido" fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} />
                            )}
                        />
                        <Controller
                            name="avatarUrl"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="URL de avatar (opcional)" fullWidth error={!!errors.avatarUrl} helperText={errors.avatarUrl?.message} />
                            )}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button variant="text" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Guardar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
