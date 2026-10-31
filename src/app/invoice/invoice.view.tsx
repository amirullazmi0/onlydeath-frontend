'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import { ChevronLeft, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import BrandLogo from '@/components/custom/brand-logo';
import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import { formatPrice } from '@/lib/utils';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { TrackOrderResponse } from '@/types/order';

const UNPAID = ['PENDING_PAYMENT', 'EXPIRED', 'CANCELLED'];

/** Blank rows keep the column lines running down the page; more would spill past one A4 */
const MIN_ROWS = 5;
const ROW_LINE = 'border-b border-neutral-300';
const COLUMN_LINE = 'border-l border-l-black';

/**
 * Printable A4 invoice (same layout as the invoice email). "Download PDF" uses the
 * browser's Save-as-PDF, so no server-side renderer is needed.
 */
export default function InvoiceView() {
    const params = useSearchParams();
    const orderNo = params.get('order_no') ?? '';
    const email = params.get('email') ?? '';

    const { data, isLoading, isError } = useQueryApiRequest<GlobalApiResponse<TrackOrderResponse>>({
        key: 'order-track',
        queries: { order_no: orderNo, email },
        options: { enabled: !!orderNo && !!email, retry: false },
        config: { errorNotification: false },
    });
    const o = data?.data;

    if (!orderNo || !email || isError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <div>
                    <p className="text-xl font-black uppercase">Invoice not found</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Check the link from your invoice email.
                    </p>
                    <Link
                        href="/track"
                        className="mt-6 inline-block text-xs font-bold uppercase underline"
                    >
                        Track an order
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading || !o) {
        return (
            <div className="mx-auto max-w-[210mm] p-10">
                <Skeleton className="h-[297mm] rounded-none" />
            </div>
        );
    }

    const m = (n: number) => formatPrice(n, o.currency);
    const originalSubtotal = o.subtotal + o.discount_total;
    const unpaid = UNPAID.includes(o.status);
    const address = [
        o.address,
        o.sub_district,
        o.district ?? o.area_name,
        o.city,
        o.state,
        o.postal_code,
        o.country_name,
    ]
        .filter(Boolean)
        .join(', ');
    const blankRows = Array.from({ length: Math.max(0, MIN_ROWS - o.items.length) });

    return (
        <div className="min-h-screen bg-neutral-200 print:bg-white py-8 print:py-0">
            {/* Toolbar (not printed) */}
            <div className="mx-auto mb-4 flex max-w-[210mm] items-center justify-between px-4 print:hidden">
                <Link
                    href={`/track?order_no=${o.order_no}`}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
                >
                    <ChevronLeft className="size-4" /> Track Order
                </Link>
                <button
                    onClick={() => globalThis.print()}
                    className="inline-flex items-center gap-2 bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white"
                >
                    <Download className="size-4" /> Download PDF
                </button>
            </div>

            {/* A4 sheet: stays A4 on phones and scrolls inside this wrapper */}
            <div className="overflow-x-auto print:overflow-visible">
                <article className="relative mx-auto w-[210mm] min-h-[297mm] bg-white px-[14mm] py-[16mm] text-[12px] text-neutral-900 shadow-xl print:shadow-none print:w-auto print:min-h-0 print:px-0 print:py-0">
                    {unpaid && (
                        <span className="pointer-events-none absolute right-[14mm] top-[60mm] rotate-[-12deg] border-4 border-neutral-300 px-4 py-1 text-3xl font-black tracking-widest text-neutral-300">
                            {o.status === 'PENDING_PAYMENT'
                                ? 'UNPAID'
                                : o.status_label.toUpperCase()}
                        </span>
                    )}

                    {/* Header: the right column lines up with the PRICE column below */}
                    <header className="grid grid-cols-[1fr_312px] items-start gap-6">
                        <div>
                            <BrandLogo
                                variant="black"
                                alt={o.store.name}
                                loading="eager"
                                className="h-11 w-auto"
                            />
                            {o.store.tagline && (
                                <p className="mt-1 text-[11px] text-neutral-500">
                                    {o.store.tagline}
                                </p>
                            )}
                        </div>
                        <div>
                            <h1 className="text-[42px] font-bold leading-none tracking-[0.14em]">
                                Invoice
                            </h1>
                            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3">
                                <dt className="font-bold">Invoice#:</dt>
                                <dd className="text-neutral-600">{o.order_no}</dd>
                                <dt className="font-bold">Date:</dt>
                                <dd className="text-neutral-600">
                                    {dayjs(o.paid_at ?? o.created_at).format('DD/MMM/YYYY')}
                                </dd>
                            </dl>
                        </div>
                    </header>

                    {/* Bill to / total */}
                    <section className="mt-10 grid grid-cols-[1fr_312px] gap-6">
                        <div className="leading-relaxed">
                            <p>Bill To:</p>
                            <p className="text-sm font-bold">{o.customer_name}</p>
                            <p className="text-neutral-600">{address}</p>
                            <p className="text-neutral-600">{o.customer_phone}</p>
                            <p className="text-neutral-600">{o.customer_email}</p>
                        </div>
                        <div>
                            <p>{unpaid ? 'Total Due:' : 'Total Paid:'}</p>
                            <p className="text-lg font-bold">
                                {m(o.total)}
                            </p>
                        </div>
                    </section>

                    {/* Items */}
                    <table className="mt-8 w-full border-collapse">
                        <thead>
                            <tr className="text-[12px] font-bold tracking-wide">
                                <th className="border-b-[1.5px] border-black py-2 text-left">
                                    ITEM DESCRIPTION
                                </th>
                                <th className="w-32 border-b-[1.5px] border-black px-3 py-2 text-right">
                                    PRICE
                                </th>
                                <th className="w-14 border-b-[1.5px] border-black py-2 text-center">
                                    QTY
                                </th>
                                <th className="w-32 border-b-[1.5px] border-black py-2 text-right">
                                    TOTAL
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {o.items.map((item, i) => {
                                const unit = item.original_price || item.price;
                                const details = [
                                    item.size_label && `Size ${item.size_label}`,
                                    item.availability === 'PRE_ORDER' && 'Pre-order',
                                    item.discount_pct > 0 && `${item.discount_pct}% off`,
                                ]
                                    .filter(Boolean)
                                    .join(' · ');
                                return (
                                    <tr key={i}>
                                        <td className={`${ROW_LINE} py-3 pr-3`}>
                                            <p className="font-bold">{item.name}</p>
                                            {details && (
                                                <p className="text-neutral-500">{details}</p>
                                            )}
                                        </td>
                                        <td
                                            className={`${ROW_LINE} ${COLUMN_LINE} px-3 py-3 text-right whitespace-nowrap`}
                                        >
                                            {m(unit)}
                                        </td>
                                        <td
                                            className={`${ROW_LINE} ${COLUMN_LINE} py-3 text-center`}
                                        >
                                            {item.quantity}
                                        </td>
                                        <td
                                            className={`${ROW_LINE} ${COLUMN_LINE} py-3 pl-3 text-right whitespace-nowrap`}
                                        >
                                            {m(unit * item.quantity)}
                                        </td>
                                    </tr>
                                );
                            })}
                            {blankRows.map((_, i) => (
                                <tr key={`blank-${i}`} className="h-10">
                                    <td className={ROW_LINE} />
                                    <td className={`${ROW_LINE} ${COLUMN_LINE}`} />
                                    <td className={`${ROW_LINE} ${COLUMN_LINE}`} />
                                    <td className={`${ROW_LINE} ${COLUMN_LINE}`} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="border-t-[1.5px] border-black" />

                    {/* Summary */}
                    <section className="mt-3 ml-auto w-[312px]">
                        <div className="flex justify-between py-1 font-bold">
                            <span>SUB TOTAL</span>
                            <span>{m(originalSubtotal)}</span>
                        </div>
                        {o.discount_total > 0 && (
                            <div className="flex justify-between py-1 text-neutral-600">
                                <span>Discount</span>
                                <span>- {m(o.discount_total)}</span>
                            </div>
                        )}
                        <div className="flex justify-between gap-4 py-1 text-neutral-600">
                            <span>
                                Shipping
                                <span className="block text-[11px]">{o.courier_name}</span>
                            </span>
                            <span className="whitespace-nowrap">{m(o.shipping_cost)}</span>
                        </div>
                        <div className="mt-2 flex justify-between border-t-[1.5px] border-black pt-3 text-base font-bold">
                            <span>Grand Total</span>
                            <span>{m(o.total)}</span>
                        </div>
                        {o.currency === 'USD' && (
                            <p className="mt-1 text-[11px] text-neutral-500">
                                Charged as {formatPrice(o.charge_total, 'IDR')} via Midtrans (1 USD
                                = {Number(o.exchange_rate).toLocaleString('en-US')} IDR)
                            </p>
                        )}
                    </section>

                    {/* Footer */}
                    <section className="mt-8 flex items-end justify-between gap-8 leading-relaxed break-inside-avoid">
                        <div className="space-y-5 text-[11px]">
                            <div>
                                <p className="text-[13px] font-bold">Payment Method</p>
                                <p className="text-neutral-600">
                                    <b className="text-black">Paid via:</b>{' '}
                                    {o.payment_method ?? (unpaid ? 'Not paid yet' : 'Midtrans')}
                                </p>
                                <p className="text-neutral-600">
                                    <b className="text-black">Order no.:</b> {o.order_no}
                                </p>
                            </div>
                            <div>
                                <p className="text-[13px] font-bold">Contact</p>
                                {o.store.address && (
                                    <p className="text-neutral-600">{o.store.address}</p>
                                )}
                                <p className="text-neutral-600">
                                    {[o.store.phone, o.store.email].filter(Boolean).join(' | ')}
                                </p>
                                {o.store.website && <p className="font-bold">{o.store.website}</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-[cursive] text-3xl italic">{o.store.name}</p>
                            <p className="font-bold">{o.store.name} Team</p>
                            <p className="text-[11px] text-neutral-500">Authorized</p>
                        </div>
                    </section>

                    <section className="mt-6 break-inside-avoid">
                        <p className="text-[13px] font-bold">Terms &amp; Condition</p>
                        <p className="text-[11px] leading-relaxed text-neutral-600">
                            Pre-order items ship once production is complete. Keep this invoice and
                            order number for tracking, returns and support requests.
                        </p>
                    </section>
                </article>
            </div>
        </div>
    );
}
