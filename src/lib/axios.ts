import axios, { InternalAxiosRequestConfig } from 'axios';
import cookies from 'js-cookie';
import { syncTokensToStore, clearAuthFromStore, setAuthCookies, clearAuthCookies } from './auth-sync';
import { AuthResponse } from '@/types/auth';

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

export const axiosInstance = axios.create({
    // Same-origin BFF (src/app/api/[...path]/route.ts) proxies to the Nest backend
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = cookies.get('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
    failedQueue = [];
};

// Endpoints whose 401 means "wrong credentials", not "expired session"
const SKIP_REFRESH = ['/auth/login', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'];

const shouldSkipRefresh = (url?: string) => SKIP_REFRESH.some((path) => url?.includes(path));

const redirectToLogin = () => {
    clearAuthFromStore();
    clearAuthCookies();

    // Buyers never log in, so only admin pages bounce to sign-in
    if (globalThis.window?.location.pathname.startsWith('/admin')) {
        globalThis.window.location.href = '/auth/sign-in';
    }
};

const handleQueuedRequest = (originalRequest: RetriableRequest) =>
    new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
    }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
    });

const handleRefreshToken = async (originalRequest: RetriableRequest) => {
    const refreshToken = cookies.get('refreshToken');

    if (!refreshToken) {
        processQueue(new Error('No refresh token'), null);
        redirectToLogin();
        throw new Error('No refresh token');
    }

    try {
        const response = await axiosInstance.post<{ success: boolean; data: AuthResponse }>(
            '/auth/refresh',
            { refresh_token: refreshToken },
        );
        const { access_token, refresh_token, expires_in } = response.data.data;

        setAuthCookies(access_token, refresh_token, expires_in);
        syncTokensToStore(access_token, refresh_token);
        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axiosInstance(originalRequest);
    } catch (refreshError) {
        processQueue(refreshError as Error, null);
        redirectToLogin();
        throw refreshError;
    }
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as RetriableRequest;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (shouldSkipRefresh(originalRequest.url)) throw error;
            if (isRefreshing) return handleQueuedRequest(originalRequest);

            originalRequest._retry = true;
            isRefreshing = true;
            try {
                return await handleRefreshToken(originalRequest);
            } finally {
                isRefreshing = false;
            }
        }

        throw error;
    },
);
