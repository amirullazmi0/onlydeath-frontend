import { cn, formatPrice, type Currency } from '@/lib/utils';
import { applyDiscount } from '@/lib/pricing';

interface PriceProps {
    /** Price before discount, in minor units of `currency` */
    amount: number;
    discountPct?: number;
    currency: Currency;
    className?: string;
    /** Show the "-20%" tag next to the price */
    showBadge?: boolean;
}

/** A line or order total: what's paid, with the pre-discount amount struck through when they differ. */
export function LineTotal({
    paid,
    original,
    currency,
    className,
}: Readonly<{ paid: number; original: number; currency: Currency; className?: string }>) {
    return (
        <span className={cn('inline-flex flex-col items-end leading-tight', className)}>
            <span>{formatPrice(paid, currency)}</span>
            {original > paid && (
                <span className="text-[0.8em] text-muted-foreground line-through">{formatPrice(original, currency)}</span>
            )}
        </span>
    );
}

/** Discounted price with the original struck through; plain price when there's no discount. */
export default function Price({ amount, discountPct = 0, currency, className, showBadge = true }: Readonly<PriceProps>) {
    if (!discountPct) return <span className={className}>{formatPrice(amount, currency)}</span>;

    return (
        <span className={cn('inline-flex flex-wrap items-baseline gap-x-2', className)}>
            <span className="font-semibold text-black">{formatPrice(applyDiscount(amount, discountPct), currency)}</span>
            <span className="text-[0.85em] text-muted-foreground line-through">{formatPrice(amount, currency)}</span>
            {showBadge && (
                <span className="self-center bg-black text-white text-[10px] font-bold px-1.5 py-0.5">-{discountPct}%</span>
            )}
        </span>
    );
}
