import { useEffect } from 'react';
import axios from 'axios';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../core/store/authStore';
import { FullPageLoader } from '../../shared/components/loaders';
import { getCurrentUser, refreshSession } from '../../modules/auth/infrastructure/services/auth.service';

/**
 * ProtectedRoute — global authentication guard.
 *
 * Responsibilities:
 * 1. If accessToken exists but user is null (page reload), restores session via GET /auth/me first,
 *    falling back to refreshSession() only if /auth/me fails with 401.
 * 2. Shows FullPageLoader during session restoration.
 * 3. If no token or restoration fails, redirects to /auth/login preserving location state.
 * 4. Once user and accessToken are present, renders child routes (FullLayout + module routes).
 */
const ProtectedRoute = () => {
    const location = useLocation();
    const {
        accessToken,
        refreshToken,
        user,
        isRestoringSession,
        setAuth,
        setUser,
        setIsRestoringSession,
        clearAuth
    } = useAuthStore();

    useEffect(() => {
        const restoreSession = async () => {
            // Only restore if we have an accessToken and no user in memory
            if (accessToken && !user && !isRestoringSession) {
                setIsRestoringSession(true);
                try {
                    try {
                        const currentUser = await getCurrentUser(accessToken);
                        setUser(currentUser);
                    } catch (err) {
                        if (axios.isAxiosError(err) && err.response?.status === 401) {
                            const session = await refreshSession(refreshToken);
                            setAuth(session.accessToken, session.user, session.refreshToken);
                        } else {
                            throw err;
                        }
                    }
                } catch {
                    clearAuth();
                } finally {
                    setIsRestoringSession(false);
                }
            }
        };

        restoreSession();
    }, [accessToken, refreshToken, user, isRestoringSession, setAuth, setUser, setIsRestoringSession, clearAuth]);

    if (isRestoringSession) {
        return <FullPageLoader message="Restoring session..." />;
    }

    if (!accessToken) {
        return (
            <Navigate
                to="/auth/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // Mandatory account activation check
    if (user && user.isVerify === false) {
        return (
            <Navigate
                to="/auth/verify-account"
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
