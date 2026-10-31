'use client';
import Link from 'next/link';
import dayjs from 'dayjs';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminPageHeader from '@/components/admin/admin.page-header';
import OrderStatusBadge from '@/components/admin/order-status-badge';
import CustomPagination from '@/components/custom/custom-pagination';
import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import { useDebounce } from '@/hooks/useDebounce';
import { countryName } from '@/lib/countries';
import { cn, formatPrice } from '@/lib/utils';
import type { GlobalApiResponse } from '@/types/api/responses';
import { ORDER_STATUS_LABEL, type Order, type OrderStatus } from '@/types/order';

const TABS: (OrderStatus | null)[] = [null, 'PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'PENDING_PAYMENT', 'REJECTED', 'CANCELLED', 'EXPIRED'];

export default function AdminOrdersView() {
    const [filters, setFilters] = useQueryStates({
        status: parseAsString,
        search: parseAsString.withDefault(''),
        page: parseAsInteger.withDefault(1),
    });
    const search = useDebounce(filters.search);

    const { data, isLoading } = useQueryApiRequest<GlobalApiResponse<Order[]>>({
        key: 'orders',
        queries: {
            page: filters.page,
            limit: 15,
            ...(filters.status && { status: filters.status }),
            ...(search && { search }),
        },
    });
    const orders = data?.data ?? [];

    return (
        <div>
            <AdminPageHeader title="Orders" description="Confirm paid orders, ship them, or reject." />

            <div className="bg-white border border-black/10">
                <div className="flex overflow-x-auto border-b border-black/10">
                    {TABS.map((s) => (
                        <button
                            key={s ?? 'ALL'}
                            onClick={() => setFilters({ status: s, page: 1 })}
                            className={cn(
                                'px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 -mb-px',
                                filters.status === s ? 'border-black' : 'border-transparent text-muted-foreground hover:text-black',
                            )}
                        >
                            {s ? ORDER_STATUS_LABEL[s] : 'All'}
                        </button>
                    ))}
                </div>
                <div className="p-4 border-b border-black/10">
                    <Input
                        value={filters.search}
                        onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
                        placeholder="Search order no, name, email..."
                        startIcon={<Search />}
                        className="md:w-80 rounded-none"
                    />
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading &&
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={6}>
                                        <Skeleton className="h-8 rounded-none" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        {orders.map((o) => (
                            <TableRow key={o.id} className="cursor-pointer">
                                <TableCell>
                                    <Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold hover:underline">
                                        {o.orderNo}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">{dayjs(o.createdAt).format('DD MMM YYYY, HH:mm')}</p>
                                </TableCell>
                                <TableCell>
                                    <p>{o.customerName}</p>
                                    <p className="text-xs text-muted-foreground">{o.customerEmail}</p>
                                </TableCell>
                                <TableCell>
                                    <p>{countryName(o.countryCode)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {o.shippingType === 'DOMESTIC' ? 'Domestic' : 'International'}
                                    </p>
                                </TableCell>
                                <TableCell className="text-xs">
                                    {o.items.reduce((n, i) => n + i.quantity, 0)} pcs
                                    {o.items.some((i) => i.availability === 'PRE_ORDER') && ' · PO'}
                                </TableCell>
                                <TableCell className="tabular-nums">{formatPrice(o.total, o.currency)}</TableCell>
                                <TableCell>
                                    <OrderStatusBadge status={o.status} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!isLoading && orders.length === 0 && (
                    <p className="p-10 text-center text-sm text-muted-foreground">No orders found.</p>
                )}
                {data?.meta && (
                    <CustomPagination
                        page={data.meta.current_page}
                        totalPage={data.meta.total_page}
                        totalData={data.meta.total_data}
                        setPage={(page) => setFilters({ page })}
                    />
                )}
            </div>
        </div>
    );
}
