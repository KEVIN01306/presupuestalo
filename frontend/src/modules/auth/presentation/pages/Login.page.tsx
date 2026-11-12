import { useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
    Box, Card, CardContent, TextField, Button, Typography,
    InputAdornment, IconButton, Alert, CircularProgress, Stack, Divider, Link,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { loginSchema, type LoginFormValues } from '../../domain/schemas/auth.schemas';
import { loginUser } from '../../infrastructure/services/auth.service';
import { useAuthStore } from '../../../../core/store/authStore';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const setAuth = useAuthStore((s) => s.setAuth);
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
        setServerError(null);
        try {
            const res = await loginUser(values);
            setAuth(res.accessToken, res.user, res.refreshToken);
            navigate(res.user.isVerify === false ? '/auth/verify-account' : from, { replace: true });
        } catch {
            setServerError('Correo o contraseña incorrectos. Intenta de nuevo.');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
            <Box sx={{ width: '100%', maxWidth: 440 }}>
                <Stack sx={{ alignItems: 'center', mb: 3.5, gap: 1 }}>
                    <Box
                        component="img"
                        src="/logo.png"
                        alt="Presupuestalo"
                        sx={{ height: 52, width: 'auto', borderRadius: 2, objectFit: 'contain', mx: 'auto', mb: 1.5 }}
                    />
                    <Typography variant="h2" sx={{ textAlign: 'center', fontWeight: 500 }}>
                        Bienvenido
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                        Inicia sesión para gestionar tus presupuestos
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
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} id="login-email" label="Correo electrónico" type="email" autoComplete="email" autoFocus fullWidth error={!!errors.email} helperText={errors.email?.message} />
                                    )}
                                />
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            id="login-password"
                                            label="Contraseña"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            fullWidth
                                            error={!!errors.password}
                                            helperText={errors.password?.message}
                                            slotProps={{
                                                input: {
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton aria-label="Mostrar contraseña" onClick={() => setShowPassword((v) => !v)} edge="end" size="small">
                                                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                    )}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Link component={RouterLink} to="/auth/change-password" variant="caption">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </Box>
                                <Button id="login-submit" type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting}>
                                    {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Iniciar sesión'}
                                </Button>
                            </Stack>
                        </form>

                        <Divider sx={{ my: 2.5 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>o continúa con</Typography>
                        </Divider>

                        <GoogleAuthButton redirectTo={from} onError={setServerError} text="signin_with" />

                        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
                            ¿No tienes cuenta?{' '}
                            <Link component={RouterLink} to="/auth/register">Crear cuenta</Link>
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default LoginPage;
