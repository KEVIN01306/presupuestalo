import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { theme } from './core/theme';
import { appRouter } from './presentation/routes/appRouter';
import './index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <GoogleOAuthProvider clientId={googleClientId}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <RouterProvider router={appRouter} />
            </ThemeProvider>
        </GoogleOAuthProvider>
    </StrictMode>
);
