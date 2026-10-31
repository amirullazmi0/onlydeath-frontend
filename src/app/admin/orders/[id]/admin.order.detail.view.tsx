'use client';
import RemoteImage from '@/components/custom/remote-image';
import Link from 'next/link';
import dayjs from 'dayjs';
import { Check, ChevronLeft, ExternalLink, FileText, PackageCheck, Truck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, LabelInput } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminPageHeader from '@/components/admin/admin.page-header';
import OrderStatusBadge from '@/components/admin/order-status-badge';
import { LineTotal } from '@/components/shop/price';
import { countryName } from '@/lib/countries';
import { formatPrice } from '@/lib/utils';
import useDetailAdminOrder, { type OrderAction } from './hooks/use-detail.admin.orders';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="bg-white border border-black/10 p-5">
        <p className="text-xs font-bold uppercase tracking-widest">{title}</p>
        <div className="mt-4">{children}</div>
    </section>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex justify-between gap-4 py-1 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-right">{children}</span>
    </div>
);

const DIALOG_COPY: Record<OrderAction, { title: string; description: string; confirm: string }> = {
    confirm: {
        title: 'Confirm order?',
        description: 'The buyer is notified that their order is being prepared.',
        confirm: 'Confirm Order',
    },
    ship: {
        title: 'Ship order?',
        description: '',
        confirm: 'Mark as Shipped',
    },
    deliver: {
        title: 'Mark as delivered?',
        description: 'Use this once the courier confirms delivery.',
        confirm: 'Mark Delivered',
    },
    reject: {
        title: 'Reject order?',
        description:
            'Stock is restored and the buyer is emailed. Refund the payment manually from the Midtrans dashboard.',
        confirm: 'Reject Order',
    },
};

export default function AdminOrderDetailView({ id }: Readonly<{ id: string }>) {
    const {
        order,
        isLoading,
        action,
        setAction,
        rejectReason,
        setRejectReason,
        shipForm,
        setShipForm,
        uploadDocument,
        uploadingDocument,
        submit,
        submitting,
    } = useDetailAdminOrder(id);

    if (isLoading || !order) return <Skeleton className="h-96 rounded-none" />;

    const isIntl = order.shippingType === 'INTERNATIONAL';
    const copy = action ? DIALOG_COPY[action] : null;
    const canSubmit =
        action === 'reject'
            ? rejectReason.trim().length >= 5
            : action === 'ship' && isIntl
              ? !!shipForm.courier_name?.trim() && !!shipForm.tracking_number?.trim()
              : true;

    return (
        <div>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-bold uppercase mb-4">
                <ChevronLeft className="size-4" /> Orders
            </Link>
            <AdminPageHeader
                title={order.orderNo}
                description={`Placed ${dayjs(order.createdAt).format('DD MMM YYYY, HH:mm')}`}
                action={
                    <div className="flex flex-wrap gap-2">
                        {order.status === 'PAID' && (
                            <Button variant="primary" onClick={() => setAction('confirm')} className="rounded-none text-xs font-bold uppercase">
                                <Check /> Confirm
                            </Button>
                        )}
                        {order.status === 'CONFIRMED' && (
                            <Button variant="primary" onClick={() => setAction('ship')} className="rounded-none text-xs font-bold uppercase">
                                <Truck /> Ship
                            </Button>
                        )}
                        {order.status === 'SHIPPED' && (
                            <Button variant="primary" onClick={() => setAction('deliver')} className="rounded-none text-xs font-bold uppercase">
                                <PackageCheck /> Mark Delivered
                            </Button>
                        )}
                        {(order.status === 'PAID' || order.status === 'CONFIRMED') && (
                            <Button variant="outline" onClick={() => setAction('reject')} className="rounded-none text-xs font-bold uppercase border-black">
                                <X /> Reject
                            </Button>
                        )}
                        <Button asChild variant="outline" className="rounded-none text-xs font-bold uppercase border-black">
                            <a
                                href={`/invoice?${new URLSearchParams({ order_no: order.orderNo, email: order.customerEmail })}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <FileText /> Invoice
                            </a>
                        </Button>
                    </div>
                }
            />

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Section title="Items">
                        <div className="divide-y divide-black/5">
                            {order.items.map((item) => (
                                <div key={item.id} className="py-3 flex gap-3">
                                    <div className="relative size-14 bg-neutral-100 shrink-0 overflow-hidden">
                                        <RemoteImage src={item.imageUrl} alt="" sizes="128px" />
                                    </div>
                                    <div className="flex-1 text-sm">
                                        <p className="font-medium">
                                            {item.name}
                                            {item.sizeLabel && <span className="ml-2 border border-black px-1.5 text-[10px] font-bold">{item.sizeLabel}</span>}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.quantity} × {formatPrice(item.price, order.currency)} · {item.weightGram} g
                                            {item.availability === 'PRE_ORDER' && ' · PRE-ORDER'}
                                        </p>
                                    </div>
                                    <LineTotal
                                        className="text-sm tabular-nums"
                                        paid={item.price * item.quantity}
                                        original={item.originalPrice * item.quantity}
                                        currency={order.currency}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 border-t border-black pt-3">
                            <Row label="Subtotal">{formatPrice(order.subtotal, order.currency)}</Row>
                            {order.discountTotal > 0 && (
                                <Row label="Discount (included)">−{formatPrice(order.discountTotal, order.currency)}</Row>
                            )}
                            <Row label="Shipping">{formatPrice(order.shippingCost, order.currency)}</Row>
                            <Row label="Total">
                                <b>{formatPrice(order.total, order.currency)}</b>
                            </Row>
                            {order.currency === 'USD' && (
                                <Row label={`Charged in IDR (1 USD = ${Number(order.exchangeRate).toLocaleString('en-US')})`}>
                                    {formatPrice(order.chargeTotal, 'IDR')}
                                </Row>
                            )}
                        </div>
                    </Section>

                    <Section title="History">
                        <ol className="border-l border-black/20 pl-5 space-y-4">
                            {[...(order.logs ?? [])].reverse().map((log) => (
                                <li key={log.id} className="relative text-sm">
                                    <span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full bg-black" />
                                    <div className="flex items-center gap-2">
                                        <OrderStatusBadge status={log.status} />
                                        <span className="text-xs text-muted-foreground">
                                            {dayjs(log.createdAt).format('DD MMM YYYY, HH:mm')}
                                            {log.actor && ` · ${log.actor}`}
                                        </span>
                                    </div>
                                    {log.note && <p className="mt-1">{log.note}</p>}
                                </li>
                            ))}
                        </ol>
                    </Section>
                </div>

                <div className="space-y-6">
                    <Section title="Status">
                        <OrderStatusBadge status={order.status} />
                        {order.rejectReason && <p className="mt-3 text-sm">Reason: {order.rejectReason}</p>}
                        <div className="mt-3">
                            <Row label="Payment">{order.payment?.paymentType ?? '—'}</Row>
                            <Row label="Paid at">{order.paidAt ? dayjs(order.paidAt).format('DD MMM, HH:mm') : '—'}</Row>
                        </div>
                    </Section>

                    <Section title="Customer">
                        <p className="text-sm font-semibold">{order.customerName}</p>
                        <p className="text-sm">{order.customerEmail}</p>
                        <p className="text-sm">{order.customerPhone}</p>
                    </Section>

                    <Section title={isIntl ? 'Shipping · International (Manual)' : 'Shipping · Domestic (Biteship)'}>
                        <p className="text-sm">
                            {[
                                order.address,
                                order.subDistrict,
                                order.district ?? order.areaName,
                                order.city,
                                order.state,
                                order.postalCode,
                                countryName(order.countryCode),
                            ]
                                .filter(Boolean)
                                .join(', ')}
                        </p>
                        {order.note && <p className="mt-2 text-xs text-muted-foreground">Note: {order.note}</p>}
                        <div className="mt-3">
                            <Row label="Courier">{order.courierName}</Row>
                            <Row label="Tracking no.">
                                <span className="font-mono">{order.waybill ?? '—'}</span>
                            </Row>
                        </div>
                        {order.trackingUrl && (
                            <a
                                href={order.trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase underline"
                            >
                                Courier tracking <ExternalLink className="size-3" />
                            </a>
                        )}
                        {order.shippingDocumentUrl && (
                            <a
                                href={order.shippingDocumentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 flex items-center gap-1 text-xs font-bold uppercase underline"
                            >
                                <FileText className="size-3" /> Shipping document
                            </a>
                        )}
                    </Section>
                </div>
            </div>

            <Dialog open={!!action} onOpenChange={(open) => !open && setAction(null)}>
                <DialogContent className="sm:max-w-md rounded-none">
                    <DialogHeader>
                        <DialogTitle>{copy?.title}</DialogTitle>
                        <DialogDescription>
                            {action === 'ship'
                                ? isIntl
                                    ? 'Manual shipment: enter the courier, tracking number and shipping document. The buyer will be emailed.'
                                    : `A Biteship pickup will be booked with ${order.courierName}.`
                                : copy?.description}
                        </DialogDescription>
                    </DialogHeader>

                    {action === 'reject' && (
                        <div className="space-y-1.5">
                            <LabelInput required>Reason (sent to buyer)</LabelInput>
                            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="rounded-none" />
                        </div>
                    )}

                    {action === 'ship' && isIntl && (
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <LabelInput required>Courier</LabelInput>
                                <Input
                                    value={shipForm.courier_name}
                                    onChange={(e) => setShipForm({ ...shipForm, courier_name: e.target.value })}
                                    placeholder="DHL, EMS, FedEx..."
                                    className="rounded-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <LabelInput required>Tracking number</LabelInput>
                                <Input
                                    value={shipForm.tracking_number}
                                    onChange={(e) => setShipForm({ ...shipForm, tracking_number: e.target.value })}
                                    className="rounded-none font-mono"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <LabelInput>Tracking URL (optional)</LabelInput>
                                <Input
                                    value={shipForm.tracking_url}
                                    onChange={(e) => setShipForm({ ...shipForm, tracking_url: e.target.value })}
                                    placeholder="https://..."
                                    className="rounded-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <LabelInput>Shipping document (optional)</LabelInput>
                                <Input
                                    type="file"
                                    accept="application/pdf,image/jpeg,image/png"
                                    onChange={(e) => uploadDocument(e.target.files?.[0])}
                                    disabled={uploadingDocument}
                                    className="rounded-none"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {uploadingDocument
                                        ? 'Uploading...'
                                        : shipForm.shipping_document_url
                                          ? 'Document attached.'
                                          : 'AWB or customs paperwork. PDF, JPG or PNG, up to 5 MB.'}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAction(null)} disabled={submitting} className="rounded-none">
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={submit}
                            disabled={submitting || uploadingDocument || !canSubmit}
                            className="rounded-none"
                        >
                            {submitting ? <Spinner /> : copy?.confirm}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
