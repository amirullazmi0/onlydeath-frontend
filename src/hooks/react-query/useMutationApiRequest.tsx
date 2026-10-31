import { allMutations, AllMutationKeys } from '@/data-services/mutations';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { constructUrl } from '@/data-services/utils/constructUrl';
import { AllQueryKeys } from '@/data-services/queries';
import { LoadingContext } from '@/provider/QueryProvider';
import { axiosInstance } from '@/lib/axios';
import { AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { AxiosErrorResponse } from '@/types/api/responses';
import { FRIENDLY_ERROR } from '@/lib/errors';

interface ApiResponse {
    message?: string;
}

/**
 * T = Response type returned by the API
 * V = Request body type sent to the API (an object, or FormData for file uploads)
 */
type MutationApiRequestProps<T> = {
    key: AllMutationKeys;
    params?: Record<string, string> | (() => Record<string, string>);
    queries?: Record<string, string | number | boolean>;
    options?: {
        onSuccess?: (data?: T) => void;
        onError?: (error?: Error) => void;
        onSettled?: () => void;
    };
    config?: {
        showLoading?: boolean;
        successNotification?: boolean;
        errorNotification?: boolean;
        successNotificationMessage?: string;
        errorNotificationMessage?: string;
    };
};

const useMutationApiRequest = <T, V>({
    key,
    queries,
    options,
    params,
    config = {
        showLoading: true,
        successNotification: true,
        errorNotification: true,
    },
}: MutationApiRequestProps<T>) => {
    const queryClient = useQueryClient();
    const mutationConfig = allMutations[key];
    const { setLoading } = useContext(LoadingContext);

    const mutationFn = async (data: V): Promise<T> => {
        const isFormData = data instanceof FormData;
        const resolvedParams = typeof params === 'function' ? params() : params;

        const requestConfig: AxiosRequestConfig = {
            url: constructUrl(mutationConfig.url, { query: resolvedParams }),
            method: mutationConfig.method,
            data,
            params: queries,
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
        };

        const response = await axiosInstance(requestConfig);
        return response.data;
    };

    return useMutation<T, AxiosErrorResponse, V>({
        mutationFn,
        onMutate: () => {
            if (config.showLoading) setLoading(true);
        },
        onSuccess: (data) => {
            if (options?.onSuccess) options.onSuccess(data);
            mutationConfig.refetchQueries?.forEach((queryKey: AllQueryKeys) => {
                queryClient.refetchQueries({ queryKey: [queryKey] });
            });
            if (config?.successNotification ?? true) {
                toast.success(
                    config?.successNotificationMessage ??
                        (data as ApiResponse)?.message ??
                        'Operation successful',
                );
            }
        },
        onError: (error) => {
            if (options?.onError) options.onError(error);
            if (config?.errorNotification ?? true) {
                const apiError = error.response?.data?.error;
                const validationMessage = Array.isArray(apiError)
                    ? apiError.join(', ')
                    : typeof apiError === 'string'
                      ? apiError
                      : undefined;
                toast.error(
                    config?.errorNotificationMessage ??
                        validationMessage ??
                        error.response?.data?.message ??
                        FRIENDLY_ERROR,
                );
            }
        },
        onSettled: () => {
            if (options?.onSettled) options.onSettled();
            if (config.showLoading) setLoading(false);
        },
    });
};

export default useMutationApiRequest;
