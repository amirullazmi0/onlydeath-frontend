import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import { useDebounce } from '@/hooks/useDebounce';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { Category, Product } from '@/types/product';

const availabilityOptions = ['READY', 'PRE_ORDER'] as const;

export default function useCatalogList() {
    const [filters, setFilters] = useQueryStates({
        availability: parseAsStringLiteral(availabilityOptions),
        category: parseAsString,
        search: parseAsString.withDefault(''),
        page: parseAsInteger.withDefault(1),
    });
    const search = useDebounce(filters.search);

    const { data, isLoading } = useQueryApiRequest<GlobalApiResponse<Product[]>>({
        key: 'products',
        queries: {
            page: filters.page,
            limit: 20,
            ...(filters.availability && { availability: filters.availability }),
            ...(filters.category && { category: filters.category }),
            ...(search && { search }),
        },
    });
    const { data: categories } = useQueryApiRequest<GlobalApiResponse<Category[]>>({
        key: 'categories',
    });

    return {
        filters,
        // Any filter change resets pagination
        setFilter: (patch: Partial<Omit<typeof filters, 'page'>>) =>
            setFilters({ ...patch, page: 1 }),
        setPage: (page: number) => setFilters({ page }),
        products: data?.data ?? [],
        meta: data?.meta,
        categories: categories?.data ?? [],
        isLoading,
    };
}
