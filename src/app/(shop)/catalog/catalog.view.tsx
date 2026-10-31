'use client';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/shop/product-card';
import CustomPagination from '@/components/custom/custom-pagination';
import { cn } from '@/lib/utils';
import useCatalogList from './hooks/use-catalog-list';

const tabs = [
    { label: 'All', value: null },
    { label: 'Ready Stock', value: 'READY' },
    { label: 'Pre-Order', value: 'PRE_ORDER' },
] as const;

export default function CatalogView() {
    const { filters, setFilter, setPage, products, meta, categories, isLoading } =
        useCatalogList();

    return (
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
            <h1 className="text-3xl font-black tracking-tight uppercase">Shop</h1>

            {/* Availability tabs */}
            <div className="mt-6 flex gap-6 border-b border-black/10">
                {tabs.map((t) => (
                    <button
                        key={t.label}
                        onClick={() => setFilter({ availability: t.value })}
                        className={cn(
                            'pb-3 -mb-px text-xs font-bold tracking-widest uppercase border-b-2',
                            filters.availability === t.value
                                ? 'border-black'
                                : 'border-transparent text-muted-foreground hover:text-black',
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="mt-6 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilter({ category: null })}
                        className={cn(
                            'px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border',
                            !filters.category ? 'bg-black text-white border-black' : 'border-black/20',
                        )}
                    >
                        All
                    </button>
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setFilter({ category: c.slug })}
                            className={cn(
                                'px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border',
                                filters.category === c.slug
                                    ? 'bg-black text-white border-black'
                                    : 'border-black/20',
                            )}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
                <div className="relative md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        value={filters.search}
                        onChange={(e) => setFilter({ search: e.target.value })}
                        placeholder="Search products..."
                        className="pl-9 rounded-none"
                    />
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10">
                {isLoading &&
                    Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-square rounded-none" />
                    ))}
                {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>

            {!isLoading && products.length === 0 && (
                <p className="py-20 text-center text-sm text-muted-foreground">
                    No products found.
                </p>
            )}

            {meta && meta.total_page > 1 && (
                <div className="mt-10">
                    <CustomPagination
                        page={meta.current_page}
                        totalPage={meta.total_page}
                        totalData={meta.total_data}
                        setPage={setPage}
                    />
                </div>
            )}
        </div>
    );
}
