'use client';
import Link from 'next/link';
import { useState } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ExternalLink, Pencil, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import AdminPageHeader from '@/components/admin/admin.page-header';
import RemoteImage from '@/components/custom/remote-image';
import ImageLightbox from '@/components/custom/image-lightbox';
import Markdown from '@/components/custom/markdown';
import Price from '@/components/shop/price';
import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import { activeDiscountPct } from '@/lib/pricing';
import { preOrderLabel } from '@/lib/preorder';
import { cn } from '@/lib/utils';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { Product, ProductDiscount } from '@/types/product';

const fmtDate = (d: string | null) => (d ? dayjs(d).format('D MMM YYYY, HH:mm') : '—');

/** Live / Scheduled / Ended / Off for a discount right now. */
function discountState(d: ProductDiscount, now = new Date()) {
    if (!d.isActive) return 'Off';
    if (d.startAt && new Date(d.startAt) > now) return 'Scheduled';
    if (d.endAt && new Date(d.endAt) < now) return 'Ended';
    return 'Live';
}

const Section = ({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) => (
    <section className={cn('bg-white border border-black/10 p-5', className)}>
        <p className="text-xs font-bold uppercase tracking-widest">{title}</p>
        <div className="mt-4">{children}</div>
    </section>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex justify-between gap-4 py-2 text-sm border-b border-black/5 last:border-0">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-right font-medium">{children}</span>
    </div>
);

export default function AdminProductDetailView({ id }: Readonly<{ id: string }>) {
    const [active, setActive] = useState(0);
    const [preview, setPreview] = useState<number | null>(null);
    const { data, isLoading } = useQueryApiRequest<GlobalApiResponse<Product>>({
        key: 'product-by-id',
        params: { id },
    });
    const p = data?.data;

    if (isLoading || !p) return <Skeleton className="h-96 rounded-none" />;

    const isPO = p.availability === 'PRE_ORDER';
    const pct = activeDiscountPct(p.discounts);
    const images = p.images.map((img) => img.url);

    return (
        <div>
            <Link href="/admin/products" className="inline-flex items-center gap-1 text-xs font-bold uppercase mb-4">
                <ChevronLeft className="size-4" /> Products
            </Link>
            <AdminPageHeader
                title={p.name}
                description={`${p.category?.name ?? 'Uncategorized'} · added ${dayjs(p.createdAt).format('D MMM YYYY')}`}
                action={
                    <div className="flex flex-wrap gap-2">
                        {p.isActive && (
                            <Button asChild variant="outline" className="rounded-none text-xs font-bold uppercase border-black">
                                <a href={`/catalog/${p.slug}`} target="_blank" rel="noreferrer">
                                    <ExternalLink /> View in Store
                                </a>
                            </Button>
                        )}
                        <Button asChild variant="primary" className="rounded-none text-xs font-bold uppercase">
                            <Link href={`/admin/products/${p.id}/edit`}>
                                <Pencil /> Edit
                            </Link>
                        </Button>
                    </div>
                }
            />

            <div className="grid lg:grid-cols-[minmax(0,420px)_1fr] gap-6">
                {/* Gallery */}
                <div>
                    <button
                        type="button"
                        onClick={() => images.length && setPreview(active)}
                        aria-label="Open image preview"
                        className="group relative block w-full aspect-square bg-white border border-black/10 cursor-zoom-in"
                    >
                        <RemoteImage src={images[active]} alt={p.name} sizes="420px" fit="contain" priority />
                        {images.length > 0 && (
                            <span className="absolute bottom-3 right-3 flex items-center gap-1 bg-black text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                <ZoomIn className="size-3" /> Preview
                            </span>
                        )}
                    </button>
                    {images.length > 1 && (
                        <div className="mt-3 grid grid-cols-5 gap-2">
                            {images.map((src, i) => (
                                <button
                                    key={src}
                                    onClick={() => setActive(i)}
                                    aria-label={`Show image ${i + 1}`}
                                    className={cn(
                                        'relative aspect-square bg-white border-2',
                                        i === active ? 'border-black' : 'border-black/10',
                                    )}
                                >
                                    <RemoteImage src={src} alt="" sizes="80px" fit="contain" />
                                </button>
                            ))}
                        </div>
                    )}
                    <ImageLightbox
                        images={images}
                        index={preview}
                        onIndexChange={(i) => {
                            setPreview(i);
                            if (i !== null) setActive(i);
                        }}
                        title={p.name}
                    />
                </div>

                <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                        <span className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                            {isPO ? `Pre-Order · ${p.poMode === 'PERIOD' ? 'Period' : 'Anytime'}` : 'Ready Stock'}
                        </span>
                        <span
                            className={cn(
                                'border text-[10px] font-bold uppercase tracking-widest px-2 py-1',
                                p.isActive ? 'border-black' : 'border-black/20 text-muted-foreground',
                            )}
                        >
                            {p.isActive ? 'Visible in store' : 'Hidden'}
                        </span>
                        {pct > 0 && (
                            <span className="border border-black text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                                -{pct}% live
                            </span>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Section title="Pricing">
                            <Field label="Indonesia (IDR)">
                                <Price amount={p.price} discountPct={pct} currency="IDR" showBadge={false} />
                            </Field>
                            <Field label="International (USD)">
                                <Price amount={p.priceUsdCents} discountPct={pct} currency="USD" showBadge={false} />
                            </Field>
                            <Field label="Weight">{p.weightGram.toLocaleString('en-US')} g</Field>
                        </Section>

                        <Section title="Availability">
                            {isPO ? (
                                <>
                                    <Field label="Pre-order">{preOrderLabel(p)}</Field>
                                    {p.poMode === 'PERIOD' && (
                                        <>
                                            <Field label="Opens">{fmtDate(p.poStartAt)}</Field>
                                            <Field label="Closes">{fmtDate(p.poEndAt)}</Field>
                                        </>
                                    )}
                                    <Field label="Production time">{p.poEstimateDays ?? '—'} days</Field>
                                </>
                            ) : (
                                <Field label="Total stock">{p.stock.toLocaleString('en-US')} pcs</Field>
                            )}
                            <Field label="Sizes">{p.sizes.length ? p.sizes.map((s) => s.label).join(', ') : 'No sizes'}</Field>
                        </Section>
                    </div>

                    {p.sizes.length > 0 && (
                        <Section title="Size Chart">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                                        <th className="pb-2 font-semibold">Size</th>
                                        <th className="pb-2 font-semibold">{isPO ? 'Status' : 'Stock'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {p.sizes.map((s) => (
                                        <tr key={s.id}>
                                            <td className="py-2 font-semibold">{s.label}</td>
                                            <td className="py-2 tabular-nums">
                                                {isPO ? (
                                                    'Made to order'
                                                ) : (
                                                    <span className={cn(s.stock === 0 && 'text-muted-foreground line-through')}>
                                                        {s.stock.toLocaleString('en-US')} pcs
                                                        {s.stock > 0 && s.stock <= 5 && ' · low'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Section>
                    )}

                    <Section title="Discounts">
                        {p.discounts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No discounts.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                                        <th className="pb-2 font-semibold">Name</th>
                                        <th className="pb-2 font-semibold">Off</th>
                                        <th className="pb-2 font-semibold">Period</th>
                                        <th className="pb-2 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {p.discounts.map((d) => {
                                        const state = discountState(d);
                                        return (
                                            <tr key={d.id}>
                                                <td className="py-2 font-medium">{d.name}</td>
                                                <td className="py-2 tabular-nums">{d.discountPct}%</td>
                                                <td className="py-2 text-xs text-muted-foreground">
                                                    {d.startAt || d.endAt ? `${fmtDate(d.startAt)} → ${fmtDate(d.endAt)}` : 'No time limit'}
                                                </td>
                                                <td className="py-2">
                                                    <span
                                                        className={cn(
                                                            'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border',
                                                            state === 'Live' ? 'bg-black text-white border-black' : 'border-black/20 text-muted-foreground',
                                                            state === 'Live' && d.discountPct === pct && 'ring-1 ring-offset-1 ring-black',
                                                        )}
                                                    >
                                                        {state}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                        {p.discounts.filter((d) => discountState(d) === 'Live').length > 1 && (
                            <p className="mt-3 text-xs text-muted-foreground">
                                Several discounts are live; buyers get the highest ({pct}%).
                            </p>
                        )}
                    </Section>

                    <Section title="Description">
                        {p.description ? (
                            <Markdown>{p.description}</Markdown>
                        ) : (
                            <p className="text-sm text-muted-foreground">No description.</p>
                        )}
                    </Section>
                </div>
            </div>
        </div>
    );
}
