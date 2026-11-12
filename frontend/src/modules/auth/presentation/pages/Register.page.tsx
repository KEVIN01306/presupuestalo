import { useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Card, CardContent, TextField, Button, Typography,
    Alert, CircularProgress, Stack, Divider, Link,
} from '@mui/material';
import { registerSchema, type RegisterFormValues } from '../../domain/schemas/auth.schemas';
import { registerUser } from '../../infrastructure/services/auth.service';
import { useAuthStore } from '../../../../core/store/authStore';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

const RegisterPage = () => {
    const [serverError, setServerError] = useState<string | null>(null);
    const setAuth = useAuthStore((s) => s.setAuth);
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
    });

    const onSubmit: SubmitHandler<RegisterFormValues> = async ({ firstName, lastName, email, password }) => {
        setServerError(null);
        try {
            const res = await registerUser({ firstName, lastName, email, password });
            setAuth(res.accessToken, res.user);
            navigate('/', { replace: true });
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setServerError(msg || 'No se pudo completar el registro. Intenta de nuevo.');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
            <Box sx={{ width: '100%', maxWidth: 460 }}>
                <Stack sx={{ alignItems: 'center', mb: 3, gap: 1 }}>
                    <Box
                        component="img"
                        src="/logo.png"
                        alt="Presupuestalo"
                        sx={{ height: 52, width: 'auto', borderRadius: 2, objectFit: 'contain', mx: 'auto', mb: 1.5 }}
                    />
                    <Typography variant="h2" sx={{ textAlign: 'center', fontWeight: 500 }}>
                        Crear cuenta
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                        Comienza a organizar tus presupuestos personales y en equipo
                    </Typography>
                </Stack>

                <Card>
                    <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                        {serverError && (
                            <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setServerError(null)}>
                                {serverError}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <Stack sx={{ gap: 2 }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}>
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
                                </Stack>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Correo electrónico" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                                    )}
                                />
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Contraseña" type="password" fullWidth error={!!errors.password} helperText={errors.password?.message} />
                                    )}
                                />
                                <Controller
                                    name="confirmPassword"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Confirmar contraseña" type="password" fullWidth error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
                                    )}
                                />
                                <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting}>
                                    {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Registrarse'}
                                </Button>
                            </Stack>
                        </form>

                        <Divider sx={{ my: 2.5 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>o regístrate con</Typography>
                        </Divider>

                        <GoogleAuthButton onError={setServerError} text="signup_with" />

                        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
                            ¿Ya tienes cuenta?{' '}
                            <Link component={RouterLink} to="/auth/login">Iniciar sesión</Link>
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default RegisterPage;
