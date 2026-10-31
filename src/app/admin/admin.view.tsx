'use client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import { Skeleton } from '@/components/ui/skeleton';
import AdminPageHeader from '@/components/admin/admin.page-header';
import OrderStatusBadge from '@/components/admin/order-status-badge';
import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import { formatPrice } from '@/lib/utils';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { DashboardSummary } from '@/types/dashboard';
import { ORDER_STATUS_LABEL, type OrderStatus } from '@/types/order';

const AdminRevenueChart = dynamic(() => import('./components/admin.revenue-chart'), { ssr: false });

const Card = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
    <section className="bg-white border border-black/10 p-5">
        <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest">{title}</p>
            {action}
        </div>
        <div className="mt-4">{children}</div>
    </section>
);

const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
    <div className="bg-white border border-black/10 p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-black tabular-nums">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
);

const STATUS_ORDER: OrderStatus[] = [
    'PAID',
    'CONFIRMED',
    'SHIPPED',
    'DELIVERED',
    'PENDING_PAYMENT',
    'REJECTED',
    'EXPIRED',
    'CANCELLED',
];

export default function AdminDashboardView() {
    const { data, isLoading } = useQueryApiRequest<GlobalApiResponse<DashboardSummary>>({
        key: 'dashboard',
    });
    const s = data?.data;

    if (isLoading || !s) {
        return (
            <div className="grid gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-none" />
                ))}
                <Skeleton className="h-80 rounded-none md:col-span-4" />
            </div>
        );
    }

    const needsAction = s.orders_by_status.PAID ?? 0;

    return (
        <div className="space-y-6">
            <AdminPageHeader title="Dashboard" description="Store overview" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat label="Revenue this month" value={formatPrice(s.month_revenue)} hint={`${s.month_orders} paid orders`} />
                <Stat label="All-time revenue" value={formatPrice(s.total_revenue)} />
                <Stat label="Awaiting confirmation" value={String(needsAction)} hint="Paid orders to review" />
                <Stat label="Products" value={String(s.product_count)} />
            </div>

            <Card title="Daily revenue · last 30 days">
                <AdminRevenueChart data={s.daily_sales} />
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card title="Orders by status">
                    <ul className="divide-y divide-black/5">
                        {STATUS_ORDER.map((status) => (
                            <li key={status} className="py-2 flex items-center justify-between text-sm">
                                <Link href={`/admin/orders?status=${status}`} className="hover:underline">
                                    {ORDER_STATUS_LABEL[status]}
                                </Link>
                                <span className="font-semibold tabular-nums">{s.orders_by_status[status] ?? 0}</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card title="Top products">
                    {s.top_products.length === 0 && <p className="text-sm text-muted-foreground">No sales yet.</p>}
                    <ol className="space-y-3">
                        {s.top_products.map((p, i) => {
                            const max = s.top_products[0].quantity || 1;
                            return (
                                <li key={p.name} className="text-sm">
                                    <div className="flex justify-between gap-2">
                                        <span className="line-clamp-1">
                                            {i + 1}. {p.name}
                                        </span>
                                        <span className="font-semibold tabular-nums">{p.quantity} sold</span>
                                    </div>
                                    <div className="mt-1 h-1.5 bg-neutral-100">
                                        <div className="h-full bg-black" style={{ width: `${(p.quantity / max) * 100}%` }} />
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </Card>

                <Card title="Low stock (ready)">
                    {s.low_stock.length === 0 && <p className="text-sm text-muted-foreground">All good.</p>}
                    <ul className="divide-y divide-black/5">
                        {s.low_stock.map((p) => (
                            <li key={p.id} className="py-2 flex justify-between text-sm">
                                <Link href={`/admin/products/${p.id}`} className="hover:underline line-clamp-1">
                                    {p.name}
                                </Link>
                                <span className="font-semibold tabular-nums">{p.stock} left</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            <Card
                title="Recent orders"
                action={
                    <Link href="/admin/orders" className="text-xs font-bold uppercase underline">
                        View all
                    </Link>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-black/5">
                            {s.recent_orders.map((o) => (
                                <tr key={o.id}>
                                    <td className="py-2 pr-4 font-mono">
                                        <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                                            {o.orderNo}
                                        </Link>
                                    </td>
                                    <td className="py-2 pr-4">{o.customerName}</td>
                                    <td className="py-2 pr-4 text-muted-foreground">{dayjs(o.createdAt).format('DD MMM, HH:mm')}</td>
                                    <td className="py-2 pr-4 tabular-nums">{formatPrice(o.total, o.currency)}</td>
                                    <td className="py-2">
                                        <OrderStatusBadge status={o.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {s.recent_orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
                </div>
            </Card>
        </div>
    );
}
