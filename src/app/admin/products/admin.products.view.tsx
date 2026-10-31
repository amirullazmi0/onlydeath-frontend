'use client';
import RemoteImage from '@/components/custom/remote-image';
import Link from 'next/link';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminPageHeader from '@/components/admin/admin.page-header';
import CustomPagination from '@/components/custom/custom-pagination';
import CustomConfirmationModal from '@/components/custom/custom-confirmation-modal';
import { cn, formatPrice } from '@/lib/utils';
import { activeDiscountPct } from '@/lib/pricing';
import useListAdminProducts from './hooks/use-list.admin.products';

const FILTERS = [
    { label: 'All', value: 'ALL' },
    { label: 'Ready', value: 'READY' },
    { label: 'Pre-Order', value: 'PRE_ORDER' },
] as const;

export default function AdminProductsView() {
    const {
        products,
        meta,
        isLoading,
        setPage,
        search,
        setSearch,
        availability,
        setAvailability,
        deleting,
        setDeleting,
        confirmDelete,
        isDeleting,
    } = useListAdminProducts();

    return (
        <div>
            <AdminPageHeader
                title="Products"
                description="Manage the catalog: ready stock and pre-order items."
                action={
                    <Button asChild variant="primary" className="rounded-none text-xs font-bold uppercase tracking-wider">
                        <Link href="/admin/products/new">
                            <Plus /> Add Product
                        </Link>
                    </Button>
                }
            />

            <div className="bg-white border border-black/10">
                <div className="p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between border-b border-black/10">
                    <div className="flex flex-wrap gap-2">
                        {FILTERS.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setAvailability(f.value)}
                                className={cn(
                                    'px-4 py-2 text-xs font-semibold uppercase tracking-wider border whitespace-nowrap',
                                    availability === f.value ? 'bg-black text-white border-black' : 'border-black/15',
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        startIcon={<Search />}
                        className="md:w-72 rounded-none"
                    />
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading &&
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={6}>
                                        <Skeleton className="h-10 rounded-none" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        {products.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="relative size-10 bg-neutral-100 shrink-0 overflow-hidden">
                                            <RemoteImage src={p.images[0].url} alt="" sizes="128px" />
                                        </div>
                                        <div>
                                            <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">
                                                {p.name}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">{p.category?.name ?? 'Uncategorized'}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="border border-black px-1.5 py-0.5 text-[10px] font-bold uppercase">
                                        {p.availability === 'PRE_ORDER'
                                            ? `PO · ${p.poMode === 'PERIOD' ? 'Period' : 'Anytime'}`
                                            : 'Ready'}
                                    </span>
                                </TableCell>
                                <TableCell className="tabular-nums">
                                    <p>{formatPrice(p.price)}</p>
                                    <p className="text-xs text-muted-foreground">{formatPrice(p.priceUsdCents, 'USD')}</p>
                                    {activeDiscountPct(p.discounts) > 0 && (
                                        <span className="mt-1 inline-block bg-black text-white text-[10px] font-bold px-1.5">
                                            -{activeDiscountPct(p.discounts)}% active
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="tabular-nums">
                                    {p.availability === 'PRE_ORDER' ? '—' : p.stock}
                                    {p.sizes.length > 0 && (
                                        <p className="text-[11px] text-muted-foreground whitespace-nowrap">
                                            {p.sizes
                                                .map((s) => (p.availability === 'PRE_ORDER' ? s.label : `${s.label}: ${s.stock}`))
                                                .join(' · ')}
                                        </p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className={cn('text-xs font-semibold', !p.isActive && 'text-muted-foreground')}>
                                        {p.isActive ? 'Active' : 'Hidden'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button asChild variant="ghost" size="icon-sm" aria-label="View">
                                            <Link href={`/admin/products/${p.id}`}>
                                                <Eye />
                                            </Link>
                                        </Button>
                                        <Button asChild variant="ghost" size="icon-sm" aria-label="Edit">
                                            <Link href={`/admin/products/${p.id}/edit`}>
                                                <Pencil />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => setDeleting(p)}>
                                            <Trash2 />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!isLoading && products.length === 0 && (
                    <p className="p-10 text-center text-sm text-muted-foreground">No products yet.</p>
                )}
                {meta && (
                    <CustomPagination
                        page={meta.current_page}
                        totalPage={meta.total_page}
                        totalData={meta.total_data}
                        setPage={setPage}
                    />
                )}
            </div>

            <CustomConfirmationModal
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                variant="danger"
                title="Delete product?"
                description={`"${deleting?.name}" will be removed from the store.`}
                confirmText="Delete"
            />
        </div>
    );
}
