import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type Currency = 'IDR' | 'USD';

/** Formats an amount in minor units of its currency: whole rupiah for IDR, cents for USD. */
export function formatPrice(value: number | string, currency: Currency = 'IDR') {
    const n = Number(value);
    if (currency === 'USD') {
        return `US$${(n / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `IDR ${n.toLocaleString('en-US')}`;
}
