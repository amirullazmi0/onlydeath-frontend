'use client';
import RemoteImage from '@/components/custom/remote-image';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronLeft, Minus, Plus, ZoomIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';
import { activeDiscountPct } from '@/lib/pricing';
import Price from '@/components/shop/price';
import { preOrderLabel, preOrderState } from '@/lib/preorder';
import Markdown from '@/components/custom/markdown';
import ImageLightbox from '@/components/custom/image-lightbox';
import { useCartStore } from '@/stores/cart.store';
import { priceIn, useDisplayCurrency } from '@/stores/currency.store';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { Product } from '@/types/product';

export default function CatalogDetailView({ slug }: Readonly<{ slug: string }>) {
    const { data, isLoading, isError } = useQueryApiRequest<GlobalApiResponse<Product>>({
        key: 'product-by-slug',
        params: { slug },
    });
    const add = useCartStore((s) => s.add);
    const currency = useDisplayCurrency();
    const [activeImage, setActiveImage] = useState(0);
    const [preview, setPreview] = useState<number | null>(null);
    const [qty, setQty] = useState(1);
    const [sizeId, setSizeId] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 md:px-8 py-10 grid md:grid-cols-2 gap-10">
                <Skeleton className="aspect-square rounded-none" />
                <Skeleton className="h-64 rounded-none" />
            </div>
        );
    }

    const product = data?.data;
    if (isError || !product) {
        return (
            <div className="py-32 text-center">
                <p className="text-sm text-muted-foreground">No products found.</p>
                <Link href="/catalog" className="mt-4 inline-block text-xs font-bold uppercase underline">
                    Back to shop
                </Link>
            </div>
        );
    }

    const isPO = product.availability === 'PRE_ORDER';
    const poState = preOrderState(product);
    const hasSizes = product.sizes.length > 0;
    const discountPct = activeDiscountPct(product.discounts);
    const discount = discountPct
        ? product.discounts.find((d) => d.discountPct === discountPct && d.isActive)
        : undefined;
    const size = product.sizes.find((s) => s.id === sizeId);
    // Stock that limits this purchase: the chosen size, or the product when unsized
    const available = isPO ? 99 : hasSizes ? (size?.stock ?? 0) : product.stock;
    const soldOut = !isPO && product.stock <= 0;
    const canBuy = !soldOut && poState === 'open' && (!hasSizes || (!!size && available > 0));
    const image = product.images[activeImage]?.url;

    const addToCart = () => {
        if (hasSizes && !size) {
            toast.error('Please choose a size');
            return;
        }
        add(
            {
                product_id: product.id,
                size_id: size?.id,
                size_label: size?.label,
                slug: product.slug,
                name: product.name,
                image_url: product.images[0]?.url,
                price: product.price,
                price_usd_cents: product.priceUsdCents,
                discount_pct: discountPct,
                availability: product.availability,
                stock: isPO ? undefined : available,
            },
            Math.min(qty, available),
        );
        toast.success(`${product.name}${size ? ` (${size.label})` : ''} added to cart`);
    };
    return (
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
            <Link
                href="/catalog"
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
            >
                <ChevronLeft className="size-4" /> Shop
            </Link>

            <div className="mt-6 grid md:grid-cols-2 gap-10">
                <div>
                    <button
                        type="button"
                        onClick={() => image && setPreview(activeImage)}
                        aria-label="Open image preview"
                        className="group relative block w-full aspect-square bg-neutral-100 overflow-hidden cursor-zoom-in"
                    >
                        <RemoteImage src={image} alt={product.name} sizes="(min-width: 768px) 50vw, 100vw" fit="contain" priority />
                        {image && (
                            <span className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                <ZoomIn className="size-3" /> Zoom
                            </span>
                        )}
                    </button>
                    {product.images.length > 1 && (
                        <div className="mt-3 grid grid-cols-5 gap-2">
                            {product.images.map((img, i) => (
                                <button
                                    key={img.id}
                                    onClick={() => setActiveImage(i)}
                                    aria-label={`Show image ${i + 1}`}
                                    className={cn(
                                        'relative aspect-square bg-neutral-100 overflow-hidden border-2',
                                        i === activeImage ? 'border-black' : 'border-transparent',
                                    )}
                                >
                                    <RemoteImage src={img.url} alt="" sizes="96px" />
                                </button>
                            ))}
                        </div>
                    )}
                    <ImageLightbox
                        images={product.images.map((img) => img.url)}
                        index={preview}
                        onIndexChange={(i) => {
                            setPreview(i);
                            if (i !== null) setActiveImage(i);
                        }}
                        title={product.name}
                    />
                </div>

                <div>
                    <span className="inline-block bg-black text-white text-[10px] font-bold tracking-widest uppercase px-2 py-1">
                        {isPO ? (product.poMode === 'PERIOD' ? 'Pre-Order · Limited Period' : 'Pre-Order') : 'Ready Stock'}
                    </span>
                    {product.category && (
                        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            {product.category.name}
                        </p>
                    )}
                    <h1 className="mt-1 text-3xl font-black uppercase tracking-tight">
                        {product.name}
                    </h1>
                    <Price
                        amount={priceIn(product, currency)}
                        discountPct={discountPct}
                        currency={currency}
                        className="mt-3 text-2xl font-semibold"
                    />
                    {discount && (
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wider">
                            {discount.name}
                            {discount.endAt && ` · until ${dayjs(discount.endAt).format('D MMM YYYY')}`}
                        </p>
                    )}

                    <p className="mt-4 text-sm text-muted-foreground">
                        {isPO
                            ? `${preOrderLabel(product)} · ready ${product.poEstimateDays ?? '-'} days after payment`
                            : soldOut
                              ? 'Out of stock.'
                              : hasSizes
                                ? 'Choose your size below.'
                                : `In stock: ${product.stock}`}
                    </p>

                    {hasSizes && (
                        <div className="mt-6">
                            <p className="text-xs font-bold uppercase tracking-widest">
                                Size{size && <span className="font-normal normal-case tracking-normal"> · {size.label}</span>}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {product.sizes.map((s) => {
                                    const out = !isPO && s.stock <= 0;
                                    return (
                                        <button
                                            key={s.id}
                                            disabled={out}
                                            onClick={() => {
                                                setSizeId(s.id);
                                                setQty(1);
                                            }}
                                            className={cn(
                                                'min-w-12 h-10 px-3 border text-sm font-semibold',
                                                s.id === sizeId ? 'bg-black text-white border-black' : 'border-black/30 hover:border-black',
                                                out && 'opacity-30 line-through cursor-not-allowed',
                                            )}
                                        >
                                            {s.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {size && !isPO && size.stock <= 5 && (
                                <p className="mt-2 text-xs font-semibold">Only {size.stock} left in {size.label}</p>
                            )}
                        </div>
                    )}

                    {canBuy && (
                        <div className="mt-6 flex items-center gap-4">
                            <div className="flex items-center border border-black">
                                <button
                                    className="p-3 disabled:opacity-30"
                                    disabled={qty <= 1}
                                    onClick={() => setQty((q) => q - 1)}
                                    aria-label="Decrease"
                                >
                                    <Minus className="size-4" />
                                </button>
                                <span className="w-10 text-center font-semibold">{qty}</span>
                                <button
                                    className="p-3 disabled:opacity-30"
                                    disabled={qty >= available}
                                    onClick={() => setQty((q) => q + 1)}
                                    aria-label="Increase"
                                >
                                    <Plus className="size-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    <Button
                        variant="primary"
                        width="full"
                        size="lg"
                        disabled={soldOut || poState !== 'open'}
                        onClick={addToCart}
                        className="mt-6 rounded-none h-12 text-xs font-bold tracking-widest uppercase"
                    >
                        {soldOut
                            ? 'Sold Out'
                            : poState === 'upcoming'
                              ? 'Pre-Order Not Open Yet'
                              : poState === 'closed'
                                ? 'Pre-Order Closed'
                                : hasSizes && !size
                                  ? 'Choose a Size'
                                  : 'Add to Cart'}
                    </Button>

                    {hasSizes && (
                        <div className="mt-10 border-t border-black/10 pt-6">
                            <p className="text-xs font-bold uppercase tracking-widest">Size Chart</p>
                            <table className="mt-3 w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50">
                                        <th className="border border-black/15 px-3 py-2 text-left font-semibold">Size</th>
                                        <th className="border border-black/15 px-3 py-2 text-left font-semibold">Availability</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {product.sizes.map((s) => (
                                        <tr key={s.id}>
                                            <td className="border border-black/15 px-3 py-2 font-semibold">{s.label}</td>
                                            <td className="border border-black/15 px-3 py-2">
                                                {isPO ? 'Pre-order' : s.stock > 0 ? `${s.stock} left` : 'Sold out'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {product.description && (
                        <div className="mt-10 border-t border-black/10 pt-6">
                            <p className="text-xs font-bold uppercase tracking-widest">Description</p>
                            <Markdown className="mt-3">{product.description}</Markdown>
                        </div>
                    )}                </div>
            </div>
        </div>
    );
}
