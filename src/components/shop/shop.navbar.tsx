'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useHydrated } from '@/hooks/useHydrated';
import { PackageSearch, ShoppingBag } from 'lucide-react';
import BrandLogo from '@/components/custom/brand-logo';
import { cartTotals, useCartStore } from '@/stores/cart.store';
import { cn } from '@/lib/utils';
import { shopMenu } from './shop.list';

export default function ShopNavbar() {
    const items = useCartStore((s) => s.items);
    const [open, setOpen] = useState(false);
    // Cart lives in localStorage; render the badge only after hydration
    const hydrated = useHydrated();

    const count = hydrated ? cartTotals(items).count : 0;

    return (
        <header className="sticky top-0 z-40 bg-white">
            <div className="mx-auto max-w-7xl h-16 px-4 md:px-8 flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <Link href="/">
                        <BrandLogo variant="black" loading="eager" className="h-7 md:h-9 w-auto" />
                    </Link>

                    {/* Opens on hover with a mouse, on tap on touch screens */}
                    <div className="group relative">
                        <button
                            onClick={() => setOpen(!open)}
                            aria-expanded={open}
                            className="py-2 text-xs font-semibold tracking-[0.15em] uppercase group-hover:underline underline-offset-8"
                        >
                            Menu
                        </button>
                        <nav
                            className={cn(
                                'absolute left-0 top-full min-w-40 bg-white py-2 group-hover:block',
                                open ? 'block' : 'hidden',
                            )}
                        >
                            {shopMenu.map((m) => (
                                <Link
                                    key={m.href}
                                    href={m.href}
                                    onClick={() => setOpen(false)}
                                    className="block px-3 py-1.5 text-xs font-semibold tracking-[0.15em] uppercase hover:bg-black hover:text-white"
                                >
                                    {m.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="flex items-center gap-1">
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
        </header>
    );
}
