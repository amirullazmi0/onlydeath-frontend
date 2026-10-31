'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, createContext, useMemo } from 'react';

interface Props {
    children: React.ReactNode;
}

interface LoadingContextType {
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

export const LoadingContext = createContext<LoadingContextType>({
    loading: false,
    setLoading: () => {},
});

export default function QueryProvider({ children }: Props) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: 1,
                    },
                },
            }),
    );
    const [loading, setLoading] = useState<boolean>(false);

    const value = useMemo(() => ({ loading, setLoading }), [loading]);

    return (
        <QueryClientProvider client={queryClient}>
            <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
        </QueryClientProvider>
    );
}
