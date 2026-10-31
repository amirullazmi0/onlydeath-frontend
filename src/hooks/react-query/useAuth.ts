import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { allMutations } from '@/data-services/mutations';
import { allQueries } from '@/data-services/queries';
import {
    LoginRequest,
    ForgetPasswordRequest,
    ResetPasswordRequest,
    AuthResponse,
    GlobalAuthResponse,
    User,
} from '@/types/auth';
import { axiosInstance } from '@/lib/axios';
import { setAuthCookies, clearAuthCookies } from '@/lib/auth-sync';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { FRIENDLY_ERROR } from '@/lib/errors';

/**
 * A session survives an expired access token: the axios interceptor renews it
 * from the refresh token mid-request.
 */
const hasSession = () => Boolean(Cookies.get('accessToken') || Cookies.get('refreshToken'));

const errorMessage = (error: Error) =>
    (error as AxiosError<{ message: string }>).response?.data?.message ?? FRIENDLY_ERROR;

/** Admin-only auth: buyers never log in. */
export const useAuth = () => {
    const queryClient = useQueryClient();
    const { setAuth, clearAuth } = useAuthStore();

    const loginMutation = useMutation<GlobalAuthResponse<AuthResponse>, Error, LoginRequest>({
        mutationFn: async (credentials) => {
            const response = await axiosInstance.post(allMutations.login.url, credentials);
            return response.data;
        },
        onSuccess: ({ data }) => {
            setAuthCookies(data.access_token, data.refresh_token, data.expires_in);
            setAuth(data.user, data.access_token, data.refresh_token);
            queryClient.setQueryData(['user'], data.user);
            toast.success('Signed in successfully');

            const redirect = new URLSearchParams(globalThis.window.location.search).get('redirect');
            globalThis.window.location.href = redirect?.startsWith('/admin') ? redirect : '/admin';
        },
        onError: (error) => toast.error(errorMessage(error)),
    });

    // Local teardown runs whether or not the backend call succeeded
    const finishLogout = () => {
        clearAuth();
        clearAuthCookies();
        queryClient.clear();
        globalThis.window.location.href = '/auth/sign-in';
    };

    const logoutMutation = useMutation<GlobalAuthResponse<null>, Error, void>({
        mutationFn: async () => {
            const response = await axiosInstance.post(allMutations.logout.url);
            return response.data;
        },
        onSuccess: finishLogout,
        onError: finishLogout,
    });

    const forgetPasswordMutation = useMutation<GlobalAuthResponse<null>, Error, ForgetPasswordRequest>({
        mutationFn: async (data) => {
            const response = await axiosInstance.post(allMutations.forgetPassword.url, data);
            return response.data;
        },
        onSuccess: (data) => toast.success(data.message),
        onError: (error) => toast.error(errorMessage(error)),
    });

    const resetPasswordMutation = useMutation<GlobalAuthResponse<null>, Error, ResetPasswordRequest>({
        mutationFn: async (data) => {
            const response = await axiosInstance.post(allMutations.resetPassword.url, data);
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            globalThis.window.location.href = '/auth/sign-in';
        },
        onError: (error) => toast.error(errorMessage(error)),
    });

    const userQuery = useQuery<User | null>({
        queryKey: ['user'],
        queryFn: async () => {
            if (!hasSession()) return null;
            try {
                const response = await axiosInstance.get(allQueries.me);
                return response.data.data ?? null;
            } catch {
                return null;
            }
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
        enabled: hasSession(),
    });

    useEffect(() => {
        if (userQuery.data && hasSession()) {
            setAuth(
                userQuery.data,
                Cookies.get('accessToken') || '',
                Cookies.get('refreshToken') || '',
            );
        } else if (!hasSession()) {
            clearAuth();
        }
    }, [userQuery.data, setAuth, clearAuth]);

    return {
        login: loginMutation.mutate,
        logout: logoutMutation.mutate,
        forgetPassword: forgetPasswordMutation.mutate,
        resetPassword: resetPasswordMutation.mutate,

        loginState: { isLoading: loginMutation.isPending },
        logoutState: { isLoading: logoutMutation.isPending },
        forgetPasswordState: {
            isLoading: forgetPasswordMutation.isPending,
            isSuccess: forgetPasswordMutation.isSuccess,
        },
        resetPasswordState: { isLoading: resetPasswordMutation.isPending },

        user: userQuery.data,
        userLoading: userQuery.isLoading,
        refetchUser: userQuery.refetch,
    };
};
