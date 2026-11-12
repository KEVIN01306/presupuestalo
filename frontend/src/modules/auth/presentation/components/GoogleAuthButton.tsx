import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { googleLoginUser } from '../../infrastructure/services/auth.service';
import { useAuthStore } from '../../../../core/store/authStore';

interface GoogleAuthButtonProps {
    redirectTo?: string;
    onError?: (message: string) => void;
    text?: 'signin_with' | 'signup_with' | 'continue_with';
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
    redirectTo = '/',
    onError,
    text = 'continue_with',
}) => {
    const [loading, setLoading] = useState(false);
    const setAuth = useAuthStore((s) => s.setAuth);
    const navigate = useNavigate();
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
        return (
            <Typography
                variant="caption"
                sx={{ display: 'block', textAlign: 'center', color: 'text.secondary' }}
            >
                Inicio con Google no configurado (falta VITE_GOOGLE_CLIENT_ID).
            </Typography>
        );
    }

    const handleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            onError?.('No se recibió el token de Google.');
            return;
        }
        setLoading(true);
        try {
            const response = await googleLoginUser(credentialResponse.credential);
            setAuth(response.accessToken, response.user);
            navigate(redirectTo, { replace: true });
        } catch {
            onError?.('No se pudo iniciar sesión con Google. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                opacity: loading ? 0.6 : 1,
                pointerEvents: loading ? 'none' : 'auto',
            }}
        >
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => onError?.('Error al conectar con Google.')}
                text={text}
                shape="pill"
                size="large"
                width="360"
            />
        </Box>
    );
};
