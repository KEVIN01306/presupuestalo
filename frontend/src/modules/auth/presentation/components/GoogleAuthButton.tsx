import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(isMobile ? 260 : 340);
    const [loading, setLoading] = useState(false);
    const setAuth = useAuthStore((s) => s.setAuth);
    const navigate = useNavigate();
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const updateWidth = () => {
            if (el.clientWidth > 0) {
                setContainerWidth(el.clientWidth);
            }
        };

        updateWidth();

        if (typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(updateWidth);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

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

    const maxWidth = isMobile ? 260 : 340;
    const buttonWidth = Math.max(200, Math.min(containerWidth, maxWidth));

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
            ref={containerRef}
            sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                overflow: 'hidden',
                opacity: loading ? 0.6 : 1,
                pointerEvents: loading ? 'none' : 'auto',
            }}
        >
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => onError?.('Error al conectar con Google.')}
                text={text}
                shape="pill"
                size={isMobile ? 'medium' : 'large'}
                width={String(buttonWidth)}
            />
        </Box>
    );
};
