'use client';
import Link from 'next/link';
import RemoteImage from '@/components/custom/remote-image';
import dayjs from 'dayjs';
import { ExternalLink, FileText } from 'lucide-react';
import { Input, LabelInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn, formatPrice } from '@/lib/utils';
import type { OrderStatus } from '@/types/order';
import { LineTotal } from '@/components/shop/price';
import useTrack from './hooks/use-track';

const PROGRESS: OrderStatus[] = ['PENDING_PAYMENT', 'PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
const PROGRESS_LABEL = ['Placed', 'Paid', 'Confirmed', 'Shipped', 'Delivered'];

export default function TrackView() {
    const { form, onSubmit, order, isFetching, payNow } = useTrack();
    const {
        register,
        formState: { errors },
    } = form;

    const step = order ? PROGRESS.indexOf(order.status) : -1;
    const failed = order && step === -1;

    return (
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-10">
            <h1 className="text-3xl font-black uppercase tracking-tight">Track Order</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Enter the order number from your invoice email and the email you used at checkout.
            </p>

            <form onSubmit={onSubmit} className="mt-6 grid md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                <div className="space-y-1.5">
                    <LabelInput required>Order Number</LabelInput>
                    <Input
                        {...register('order_no')}
                        placeholder="OD-20261010-XXXXXXXX"
                        className="rounded-none font-mono uppercase"
                    />
                    {errors.order_no && <p className="text-xs text-destructive">{errors.order_no.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <LabelInput required>Email</LabelInput>
                    <Input type="email" {...register('email')} className="rounded-none" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isFetching}
                    className="h-9 rounded-none px-8 text-xs font-bold tracking-widest uppercase"
                >
                    {isFetching ? <Spinner /> : 'Track'}
                </Button>
            </form>

            {order && (
                <div className="mt-12 space-y-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black pb-6">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                Order
                            </p>
                            <p className="mt-1 text-2xl font-mono font-bold">{order.order_no}</p>
                            <p className="text-xs text-muted-foreground">
                                Placed {dayjs(order.created_at).format('DD MMM YYYY, HH:mm')}
                            </p>
                        </div>
                        <div className="text-left md:text-right">
                            <span className="inline-block bg-black text-white text-xs font-bold tracking-widest uppercase px-3 py-1.5">
                                {order.status_label}
                            </span>
                            <div className="mt-3 flex flex-wrap gap-2 md:justify-end">
                                {order.payment && (
                                    <Button
                                        onClick={payNow}
                                        variant="outline"
                                        className="rounded-none border-black text-xs font-bold tracking-widest uppercase"
                                    >
                                        Continue Payment
                                    </Button>
                                )}
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-none border-black text-xs font-bold tracking-widest uppercase"
                                >
                                    <Link
                                        href={`/invoice?${new URLSearchParams({ order_no: order.order_no, email: order.customer_email })}`}
                                        target="_blank"
                                    >
                                        <FileText /> Invoice
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    {failed ? (
                        <div className="border border-black p-4 text-sm">
                            This order is <b>{order.status_label.toLowerCase()}</b>.
                            {order.reject_reason && <> Reason: {order.reject_reason}</>}
                        </div>
                    ) : (
                        <ol className="grid grid-cols-5">
                            {PROGRESS_LABEL.map((label, i) => (
                                <li key={label} className="flex flex-col items-center text-center">
                                    <div className="flex items-center w-full">
                                        <div className={cn('h-0.5 flex-1', i === 0 ? 'invisible' : i <= step ? 'bg-black' : 'bg-black/15')} />
                                        <span
                                            className={cn(
                                                'size-3 rounded-full border-2 border-black',
                                                i <= step ? 'bg-black' : 'bg-white',
                                            )}
                                        />
                                        <div className={cn('h-0.5 flex-1', i === 4 ? 'invisible' : i < step ? 'bg-black' : 'bg-black/15')} />
                                    </div>
                                    <span
                                        className={cn(
                                            'mt-2 text-[10px] md:text-xs font-bold uppercase tracking-wider',
                                            i > step && 'text-muted-foreground',
                                        )}
                                    >
                                        {label}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    )}

                    <div className="grid md:grid-cols-2 gap-10">
                        {/* Items */}
                        <section>
                            <p className="text-xs font-bold uppercase tracking-widest">Items</p>
                            <div className="mt-4 divide-y divide-black/10 border-y border-black/10">
                                {order.items.map((item, i) => (
                                    <div key={i} className="py-3 flex gap-3">
                                        <div className="relative size-16 shrink-0 bg-neutral-100 overflow-hidden">
                                            <RemoteImage src={item.image_url} alt={item.name} sizes="128px" />
                                        </div>
                                        <div className="flex-1 min-w-0 text-sm">
                                            <p className="font-medium line-clamp-1">
                                                {item.name}
                                                {item.size_label && <span className="text-muted-foreground"> · Size {item.size_label}</span>}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.quantity} × {formatPrice(item.price, order.currency)}
                                                {item.availability === 'PRE_ORDER' && ' · Pre-Order'}
                                            </p>
                                        </div>
                                        <LineTotal
                                            className="text-sm"
                                            paid={item.price * item.quantity}
                                            original={item.original_price * item.quantity}
                                            currency={order.currency}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(order.subtotal, order.currency)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>{formatPrice(order.shipping_cost, order.currency)}</span>
                                </div>
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>{formatPrice(order.total, order.currency)}</span>
                                </div>
                                {order.currency === 'USD' && (
                                    <p className="text-xs text-muted-foreground">
                                        Charged as {formatPrice(order.charge_total, 'IDR')} via Midtrans.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Shipping */}
                        <section>
                            <p className="text-xs font-bold uppercase tracking-widest">Shipping</p>
                            <div className="mt-4 text-sm space-y-1">
                                <p className="font-semibold">{order.customer_name}</p>
                                <p className="text-muted-foreground">
                                    {[
                                        order.address,
                                        order.sub_district,
                                        order.district ?? order.area_name,
                                        order.city,
                                        order.state,
                                        order.postal_code,
                                        order.country_name,
                                    ]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                                <p className="pt-2">
                                    Courier: <b>{order.courier_name}</b>
                                </p>
                                {order.waybill && (
                                    <p>
                                        Tracking no.: <b className="font-mono">{order.waybill}</b>
                                    </p>
                                )}
                                {order.tracking_url && (
                                    <a
                                        href={order.tracking_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-bold uppercase underline"
                                    >
                                        Track with courier <ExternalLink className="size-3" />
                                    </a>
                                )}
                            </div>

                            {order.tracking && order.tracking.history.length > 0 && (
                                <ol className="mt-6 border-l border-black/20 pl-5 space-y-4">
                                    {[...order.tracking.history].reverse().map((h, i) => (
                                        <li key={i} className="relative text-sm">
                                            <span
                                                className={cn(
                                                    'absolute -left-[25px] top-1.5 size-2.5 rounded-full',
                                                    i === 0 ? 'bg-black' : 'bg-black/30',
                                                )}
                                            />
                                            <p className="font-medium">{h.note}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {dayjs(h.updated_at).format('DD MMM YYYY, HH:mm')}
                                            </p>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </section>
                    </div>

                    {/* Order history */}
                    <section>
                        <p className="text-xs font-bold uppercase tracking-widest">Order History</p>
                        <ol className="mt-4 border-l border-black/20 pl-5 space-y-4">
                            {[...order.logs].reverse().map((log, i) => (
                                <li key={i} className="relative text-sm">
                                    <span
                                        className={cn(
                                            'absolute -left-[25px] top-1.5 size-2.5 rounded-full',
                                            i === 0 ? 'bg-black' : 'bg-black/30',
                                        )}
                                    />
                                    <p className="font-medium">{log.note}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {dayjs(log.created_at).format('DD MMM YYYY, HH:mm')}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>
            )}
        </div>
    );
}
