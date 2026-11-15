import { create } from 'zustand';
import type { Currency } from '@/lib/utils';
import type { Product } from '@/types/product';
import { useHydrated } from '@/hooks/useHydrated';

/** Used on the server and for the first client render, before the timezone is known. */
export const DEFAULT_CURRENCY: Currency = 'USD';

const INDONESIA_TIMEZONES = ['Asia/Jakarta', 'Asia/Pontianak', 'Asia/Makassar', 'Asia/Jayapura'];

/** Buyers in Indonesia see IDR, everyone else USD. */
const detectCurrency = (): Currency => {
    if (typeof window === 'undefined') return DEFAULT_CURRENCY;
    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
    return INDONESIA_TIMEZONES.includes(timeZone) ? 'IDR' : 'USD';
};

interface CurrencyState {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
}

/** Display currency for buyers. Checkout overrides it from the shipping country. */
export const useCurrencyStore = create<CurrencyState>()((set) => ({
    currency: detectCurrency(),
    setCurrency: (currency) => set({ currency }),
}));

/** Product unit price in minor units of the given currency. */
export const priceIn = (p: Pick<Product, 'price' | 'priceUsdCents'>, currency: Currency) =>
    currency === 'USD' ? p.priceUsdCents : p.price;

/** Buyer display currency; the default until hydrated so SSR and the first client render match. */
export const useDisplayCurrency = (): Currency => {
    const currency = useCurrencyStore((s) => s.currency);
    return useHydrated() ? currency : DEFAULT_CURRENCY;
};
