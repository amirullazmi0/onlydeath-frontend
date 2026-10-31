'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useHydrated } from '@/hooks/useHydrated';
import { Menu, PackageSearch, ShoppingBag, X } from 'lucide-react';
import BrandLogo from '@/components/custom/brand-logo';
import { cartTotals, useCartStore } from '@/stores/cart.store';
import { useCurrencyStore, useDisplayCurrency } from '@/stores/currency.store';
import { cn } from '@/lib/utils';
import { shopMenu } from './shop.list';

export default function ShopNavbar() {
    const pathname = usePathname();
    const items = useCartStore((s) => s.items);
    const [open, setOpen] = useState(false);
    // Cart lives in localStorage; render the badge only after hydration
    const hydrated = useHydrated();

    const count = hydrated ? cartTotals(items).count : 0;
    const currency = useDisplayCurrency();
    const setCurrency = useCurrencyStore((s) => s.setCurrency);

    return (
        <>
            <div className="bg-black text-white text-center text-[11px] font-semibold tracking-[0.2em] uppercase py-2 px-4">
                Ready stock & pre-order · Worldwide shipping
            </div>
            <header className="sticky top-0 z-40 bg-white border-b border-black/10">
                <div className="mx-auto max-w-7xl h-16 px-4 md:px-8 flex items-center justify-between">
                    <button
                        className="md:hidden p-2 -ml-2"
                        onClick={() => setOpen(!open)}
                        aria-label="Menu"
                    >
                        {open ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>

                    <Link href="/">
                        <BrandLogo variant="black" loading="eager" className="h-7 md:h-9 w-auto" />
                    </Link>

                    <nav className="hidden md:flex items-center gap-10">
                        {shopMenu.map((m) => (
                            <Link
                                key={m.href}
                                href={m.href}
                                className={cn(
                                    'text-xs font-semibold tracking-[0.15em] uppercase hover:underline underline-offset-8',
                                    pathname === m.href && 'underline',
                                )}
                            >
                                {m.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-1">
                        <div className="hidden sm:flex mr-2 border border-black text-[10px] font-bold tracking-widest">
                            {(['IDR', 'USD'] as const).map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setCurrency(c)}
                                    className={cn('px-2 py-1', currency === c ? 'bg-black text-white' : 'bg-white')}
                                    aria-pressed={currency === c}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                        <Link href="/track" className="p-2" aria-label="Track order">
                            <PackageSearch className="size-5" />
                        </Link>
                        <Link href="/cart" className="relative p-2" aria-label="Cart">
                            <ShoppingBag className="size-5" />
                            {count > 0 && (
                                <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                                    {count}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {open && (
                    <nav className="md:hidden border-t border-black/10 flex flex-col">
                        <div className="px-4 py-3 flex items-center justify-between border-b border-black/5">
                            <span className="text-xs font-semibold tracking-widest uppercase">Currency</span>
                            <div className="flex border border-black text-[10px] font-bold tracking-widest">
                                {(['IDR', 'USD'] as const).map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setCurrency(c)}
                                        className={cn('px-3 py-1', currency === c ? 'bg-black text-white' : 'bg-white')}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {shopMenu.map((m) => (
                            <Link
                                key={m.href}
                                href={m.href}
                                onClick={() => setOpen(false)}
                                className="px-4 py-3 text-sm font-semibold tracking-widest uppercase border-b border-black/5"
                            >
                                {m.label}
                            </Link>
                        ))}
                    </nav>
                )}
            </header>
        </>
    );
}
