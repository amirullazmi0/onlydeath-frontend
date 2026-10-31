'use client';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useContext, useEffect } from 'react';
import { constructUrl } from '@/data-services/utils/constructUrl';
import { allQueries } from '@/data-services/queries';
import { LoadingContext } from '@/provider/QueryProvider';
import { axiosInstance } from '@/lib/axios';
import { AxiosErrorResponse } from '@/types/api/responses';
import { toast } from 'sonner';
import { FRIENDLY_ERROR } from '@/lib/errors';

type QueryApiRequestProps<T> = {
    key: keyof typeof allQueries;
    params?: Record<string, unknown>;
    queries?: Record<string, unknown>;
    options?: Omit<UseQueryOptions<T, AxiosErrorResponse>, 'queryKey' | 'queryFn'>;
    onSuccess?: (data: T) => void;
    config?: {
        showLoading?: boolean;
        successNotification?: boolean;
        errorNotification?: boolean;
        successNotificationMessage?: string;
        errorNotificationMessage?: string;
    };
};

const useQueryApiRequest = <T,>({
    key,
    params,
    queries,
    options,
    config = {
        showLoading: false,
        successNotification: false,
        errorNotification: true,
    },
    onSuccess,
}: QueryApiRequestProps<T>) => {
    const queryKey = [key, params, queries];
    const { setLoading } = useContext(LoadingContext);

    const queryFn = async (): Promise<T> => {
        const url = constructUrl(allQueries[key], {
            query: params as Record<string, string> | undefined,
        });
        const response = await axiosInstance.get(url, { params: queries });
        return response.data;
    };

    const queryFetch = useQuery<T, AxiosErrorResponse>({
        queryKey,
        queryFn,
        ...options,
    });

    useEffect(() => {
        if (config.showLoading) {
            if (queryFetch.isLoading) setLoading(true);
            if (queryFetch.isError || queryFetch.isSuccess) setLoading(false);
        }

        if (queryFetch.isError && config.errorNotification) {
            const apiError = queryFetch.error.response?.data?.error;
            const validationMessage = Array.isArray(apiError)
                ? apiError.join(', ')
                : typeof apiError === 'string'
                  ? apiError
                  : undefined;
            toast.error(
                config.errorNotificationMessage ??
                    validationMessage ??
                    queryFetch.error.response?.data?.message ??
                    FRIENDLY_ERROR,
            );
        }

        if (queryFetch.isSuccess) {
            if (onSuccess && queryFetch.data) onSuccess(queryFetch.data);
            if (config.successNotification) {
                toast.success(config.successNotificationMessage ?? 'Data loaded successfully');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryFetch.isLoading, queryFetch.isError, queryFetch.isSuccess, queryFetch.data, queryFetch.error]);

    return queryFetch;
};

export default useQueryApiRequest;
