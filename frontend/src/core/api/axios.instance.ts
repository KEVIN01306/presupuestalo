import axios, { type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './config';
import { useAuthStore } from '../store/authStore';
import { refreshSession } from '../../modules/auth/infrastructure/services/auth.service';

/**
 * Authenticated Axios instance.
 * Automatically attaches the access token from the auth store on every request.
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

// Request interceptor — attach access token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().accessToken;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Shared promise for concurrent 401 handling
let refreshPromise: Promise<string> | null = null;

// Response interceptor — handle token expiry & auto-refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (axios.isAxiosError(error) && error.response) {
            const status = error.response.status;
            const code = (error.response.data as any)?.code;

            // Check if 401 and not already retried
            const isTokenExpired = status === 401 && (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN' || !code);

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
    },
);
