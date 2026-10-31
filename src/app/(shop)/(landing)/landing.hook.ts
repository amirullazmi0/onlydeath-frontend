import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { Category, Product } from '@/types/product';

export default function useLanding() {
    const { data: products, isLoading } = useQueryApiRequest<GlobalApiResponse<Product[]>>({
        key: 'products',
        queries: { page: 1, limit: 12 },
    });
    const { data: categories } = useQueryApiRequest<GlobalApiResponse<Category[]>>({
        key: 'categories',
    });

    const items = products?.data ?? [];

    return {
        trending: items,
        isLoading,
        // Use any product photo from the category as the tile background
        categories: (categories?.data ?? [])
            .filter((c) => (c._count?.products ?? 0) > 0)
            .slice(0, 5)
            .map((c) => ({
                ...c,
                image: items.find((p) => p.categoryId === c.id)?.images[0]?.url,
            })),
    };
}
