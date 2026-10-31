import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Currency } from '@/lib/utils';
import type { Product } from '@/types/product';
import { useHydrated } from '@/hooks/useHydrated';

/** Store-wide default; buyers can switch, and checkout follows the shipping country. */
export const DEFAULT_CURRENCY: Currency = 'USD';

interface CurrencyState {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
}

/** Display currency for buyers. Checkout overrides it from the shipping country. */
export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set) => ({
            currency: DEFAULT_CURRENCY,
            setCurrency: (currency) => set({ currency }),
        }),
        // v2: default changed to USD; drops the old auto-guessed value once
        { name: 'onlydeath-currency', version: 2 },
    ),
);

/** Product unit price in minor units of the given currency. */
export const priceIn = (p: Pick<Product, 'price' | 'priceUsdCents'>, currency: Currency) =>
    currency === 'USD' ? p.priceUsdCents : p.price;

/** Buyer display currency; the default until hydrated so SSR and the first client render match. */
export const useDisplayCurrency = (): Currency => {
    const currency = useCurrencyStore((s) => s.currency);
    return useHydrated() ? currency : DEFAULT_CURRENCY;
};
