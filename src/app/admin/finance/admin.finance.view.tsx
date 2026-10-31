'use client';
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, LabelInput } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import AdminPageHeader from '@/components/admin/admin.page-header';
import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import { formatPrice } from '@/lib/utils';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { FinanceSummary } from '@/types/dashboard';

const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
    <div className="bg-white border border-black/10 p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-black tabular-nums">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
);

export default function AdminFinanceView() {
    const [range, setRange] = useState({ from: '', to: '' });
    const { data, isLoading } = useQueryApiRequest<GlobalApiResponse<FinanceSummary>>({
        key: 'finance',
        queries: {
            ...(range.from && { from: range.from }),
            ...(range.to && { to: range.to }),
        },
    });
    const f = data?.data;

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Finance & Payout"
                description="Payments settle into your Midtrans balance. Withdrawals are made from the Midtrans dashboard."
                action={
                    f && (
                        <Button asChild variant="primary" className="rounded-none text-xs font-bold uppercase tracking-wider">
                            <a href={f.midtrans_dashboard_url} target="_blank" rel="noreferrer">
                                Open Midtrans Dashboard <ExternalLink />
                            </a>
                        </Button>
                    )
                }
            />

            <div className="bg-white border border-black/10 p-4 flex flex-wrap items-end gap-4">
                <div className="space-y-1.5">
                    <LabelInput>From</LabelInput>
                    <Input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="rounded-none" />
                </div>
                <div className="space-y-1.5">
                    <LabelInput>To</LabelInput>
                    <Input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="rounded-none" />
                </div>
                {(range.from || range.to) && (
                    <Button variant="ghost" onClick={() => setRange({ from: '', to: '' })} className="rounded-none text-xs uppercase">
                        Clear
                    </Button>
                )}
            </div>

            {isLoading || !f ? (
                <Skeleton className="h-40 rounded-none" />
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Stat label="Payments received" value={formatPrice(f.received_total)} hint={`${f.received_count} orders`} />
                        <Stat label="Products" value={formatPrice(f.received_subtotal)} hint="Excluding shipping" />
                        <Stat label="Shipping collected" value={formatPrice(f.received_shipping)} />
                        <Stat
                            label="Refunds due"
                            value={formatPrice(f.refund_due_total)}
                            hint={`${f.refund_due_count} rejected paid orders`}
                        />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <section className="bg-white border border-black/10 p-5">
                            <p className="text-xs font-bold uppercase tracking-widest">By payment method</p>
                            <table className="mt-4 w-full text-sm">
                                <tbody className="divide-y divide-black/5">
                                    {f.by_method.map((m) => (
                                        <tr key={m.payment_type}>
                                            <td className="py-2 capitalize">{m.payment_type.replaceAll('_', ' ')}</td>
                                            <td className="py-2 text-muted-foreground">{m.count} orders</td>
                                            <td className="py-2 text-right tabular-nums font-semibold">{formatPrice(m.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {f.by_method.length === 0 && <p className="text-sm text-muted-foreground">No payments in this period.</p>}
                        </section>

                        <section className="bg-black text-white p-5">
                            <p className="text-xs font-bold uppercase tracking-widest">How to withdraw</p>
                            <ol className="mt-4 space-y-2 text-sm text-neutral-300 list-decimal list-inside">
                                <li>Open the Midtrans dashboard and sign in.</li>
                                <li>Check your available balance (settled payments minus Midtrans fees).</li>
                                <li>Withdraw to the bank account registered with Midtrans.</li>
                                <li>Process refunds for rejected orders from the transaction detail page.</li>
                            </ol>
                            <p className="mt-4 text-xs text-neutral-500">
                                Pending payments: {formatPrice(f.pending_payment_total)} ({f.pending_payment_count} orders) are not
                                counted until paid.
                            </p>
                        </section>
                    </div>
                </>
            )}
        </div>
    );
}
