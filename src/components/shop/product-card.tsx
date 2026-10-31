'use client';
import Link from 'next/link';
import RemoteImage from '@/components/custom/remote-image';
import { activeDiscountPct, applyDiscount } from '@/lib/pricing';
import { preOrderState } from '@/lib/preorder';
import { formatPrice } from '@/lib/utils';
import { priceIn, useDisplayCurrency } from '@/stores/currency.store';
import type { Product } from '@/types/product';

/**
 * Minimal catalog tile: image, name and price only. Size, quantity and
 * add-to-cart live on the product page.
 */
export default function ProductCard({ product }: Readonly<{ product: Product }>) {
    const currency = useDisplayCurrency();
    const isPO = product.availability === 'PRE_ORDER';
    const poState = preOrderState(product);
    const soldOut = !isPO && product.stock <= 0;
    const discountPct = activeDiscountPct(product.discounts);
    const price = priceIn(product, currency);

    // Black box over the image, like a "sold out" sticker
    const overlay = soldOut
        ? 'Sold Out'
        : poState === 'upcoming'
          ? 'Coming Soon'
          : poState === 'closed'
            ? 'PO Closed'
            : null;

    return (
        <Link href={`/catalog/${product.slug}`} className="group block">
            <div className="relative aspect-square bg-neutral-100 overflow-hidden">
                <RemoteImage
                    src={product.images[0]?.url}
                    alt={product.name}
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
                    fit="contain"
                    className="transition-transform duration-500 group-hover:scale-105"
                />
                {overlay && (
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-2.5 py-2 text-center text-[9px] font-bold uppercase leading-tight tracking-widest text-white">
                        {overlay.split(' ').map((w) => (
                            <span key={w} className="block">
                                {w}
                            </span>
                        ))}
                    </span>
                )}
            </div>
            <div className="mt-3 text-center font-mono text-[11px] uppercase leading-relaxed tracking-wide">
                <p className="line-clamp-2 px-1">{product.name}</p>
                <p className="text-neutral-500">
                    {discountPct > 0 ? (
                        <>
                            <span className="text-black">{formatPrice(applyDiscount(price, discountPct), currency)}</span>{' '}
                            <span className="line-through">{formatPrice(price, currency)}</span>
                        </>
                    ) : (
                        formatPrice(price, currency)
                    )}
                    {isPO && poState === 'open' && <span> · Pre-order</span>}
                </p>
            </div>
        </Link>
    );
}
