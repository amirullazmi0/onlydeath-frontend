import { useState } from 'react';
import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import useMutationApiRequest from '@/hooks/react-query/useMutationApiRequest';
import { useDebounce } from '@/hooks/useDebounce';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { Product, ProductAvailability } from '@/types/product';

export default function useListAdminProducts() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [availability, setAvailability] = useState<ProductAvailability | 'ALL'>('ALL');
    const debounced = useDebounce(search);
    const [deleting, setDeleting] = useState<Product | null>(null);

    const { data, isLoading } = useQueryApiRequest<GlobalApiResponse<Product[]>>({
        key: 'products-admin',
        queries: {
            page,
            limit: 10,
            ...(debounced && { search: debounced }),
            ...(availability !== 'ALL' && { availability }),
        },
    });

    const deleteMutation = useMutationApiRequest<GlobalApiResponse<null>, void>({
        key: 'delete-product',
        params: () => ({ id: deleting?.id ?? '' }),
        options: { onSuccess: () => setDeleting(null) },
    });

    return {
        products: data?.data ?? [],
        meta: data?.meta,
        isLoading,
        page,
        setPage,
        search,
        setSearch: (v: string) => {
            setSearch(v);
            setPage(1);
        },
        availability,
        setAvailability: (v: ProductAvailability | 'ALL') => {
            setAvailability(v);
            setPage(1);
        },
        deleting,
        setDeleting,
        confirmDelete: () => deleteMutation.mutate(),
        isDeleting: deleteMutation.isPending,
    };
}
