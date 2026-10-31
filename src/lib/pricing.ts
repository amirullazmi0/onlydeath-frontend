import type { ProductDiscount } from '@/types/product';

/** Highest active discount right now; mirrors the backend rule (no stacking). */
export function activeDiscountPct(discounts: ProductDiscount[], now = new Date()) {
    return discounts.reduce((max, d) => {
        const live =
            d.isActive &&
            (!d.startAt || new Date(d.startAt) <= now) &&
            (!d.endAt || new Date(d.endAt) >= now);
        return live ? Math.max(max, d.discountPct) : max;
    }, 0);
}

/** Discounted amount in the same minor units (rupiah / cents), rounded like the backend. */
export const applyDiscount = (amount: number, pct: number) => Math.round((amount * (100 - pct)) / 100);
