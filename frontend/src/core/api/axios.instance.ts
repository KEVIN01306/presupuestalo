import axios, { type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './config';
import { useAuthStore } from '../store/authStore';
import { refreshSession } from '../../modules/auth/infrastructure/services/auth.service';

/**
 * Authenticated Axios instance.
 * Automatically attaches Bearer accessToken and x-team-id header from auth store.
 * Handles 401 responses by refreshing the token and retrying the request.
 */
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 60000,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const { accessToken, activeTeamId } = useAuthStore.getState();
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        if (activeTeamId && config.headers) {
            config.headers['x-team-id'] = activeTeamId;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (axios.isAxiosError(error) && error.response && originalRequest) {
            const status = error.response.status;
            const code = (error.response.data as { code?: string } | undefined)?.code;
            const isAuthEndpoint = originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login');
            const isTokenExpired = status === 401 && !isAuthEndpoint && (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN' || !code);

            if (isTokenExpired && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    if (!refreshPromise) {
                        refreshPromise = (async () => {
                            try {
                                const { accessToken, user } = await refreshSession();
                                useAuthStore.getState().setAuth(accessToken, user);
                                return accessToken;
                            } finally {
                                refreshPromise = null;
                            }
                        })();
                    }

                    const newToken = await refreshPromise;
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }
                    return api(originalRequest);
                } catch (refreshErr) {
                    useAuthStore.getState().clearAuth();
                    return Promise.reject(refreshErr);
                }
            }
        }

        return Promise.reject(error);
    }
);
