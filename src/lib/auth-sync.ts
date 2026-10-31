import Cookies from 'js-cookie';
import { useAuthStore } from '@/stores/auth.store';

const REFRESH_TOKEN_DAYS = 7;

const baseCookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
};

export const setAuthCookies = (
    accessToken: string,
    refreshToken?: string,
    expiresInSeconds?: number,
) => {
    Cookies.set('accessToken', accessToken, {
        ...baseCookieOptions,
        expires: expiresInSeconds
            ? new Date(Date.now() + expiresInSeconds * 1000)
            : REFRESH_TOKEN_DAYS,
    });

    if (refreshToken) {
        Cookies.set('refreshToken', refreshToken, {
            ...baseCookieOptions,
            expires: REFRESH_TOKEN_DAYS,
        });
    }
};

export const clearAuthCookies = () => {
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
};

export const syncTokensToStore = (accessToken: string, refreshToken?: string) => {
    useAuthStore.getState().updateTokens(accessToken, refreshToken);
};

export const clearAuthFromStore = () => {
    useAuthStore.getState().clearAuth();
};
