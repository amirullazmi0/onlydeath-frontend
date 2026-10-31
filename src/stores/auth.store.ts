import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth';

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;

    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    setUser: (user: User) => void;
    clearAuth: () => void;
    updateTokens: (accessToken: string, refreshToken?: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            setAuth: (user, accessToken, refreshToken) =>
                set({ user, accessToken, refreshToken, isAuthenticated: true }),

            setUser: (user) => set({ user, isAuthenticated: true }),

            clearAuth: () =>
                set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),

            updateTokens: (accessToken, refreshToken) =>
                set((state) => ({
                    accessToken,
                    refreshToken: refreshToken || state.refreshToken,
                })),
        }),
        {
            name: 'onlydeath-auth-storage',
            // Only persist user data, NOT tokens (tokens live in cookies)
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
);
