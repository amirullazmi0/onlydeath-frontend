'use client';
import RemoteImage from '@/components/custom/remote-image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { cartBasePrice, cartTotals, cartUnitPrice, useCartStore } from '@/stores/cart.store';
import { LineTotal } from '@/components/shop/price';
import { useDisplayCurrency } from '@/stores/currency.store';
import { useHydrated } from '@/hooks/useHydrated';

export default function CartView() {
    const hydrated = useHydrated();
    const { items, setQuantity, remove } = useCartStore();
    const currency = useDisplayCurrency();
    const { subtotal, count } = cartTotals(items, currency);

    if (!hydrated) return <div className="min-h-[50vh]" />;

    if (items.length === 0) {
        return (
            <div className="py-32 text-center">
                <p className="text-2xl font-black uppercase">Your cart is empty</p>
                <Link
                    href="/catalog"
                    className="mt-6 inline-block bg-black text-white text-xs font-bold tracking-widest uppercase px-6 py-3"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
            <h1 className="text-3xl font-black uppercase tracking-tight">Cart</h1>

            <div className="mt-8 grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 divide-y divide-black/10 border-y border-black/10">
                    {items.map((item) => {
                        const isPO = item.availability === 'PRE_ORDER';
                        return (
                            <div key={item.key} className="py-5 flex gap-4">
                                <Link
                                    href={`/catalog/${item.slug}`}
                                    className="relative size-24 shrink-0 bg-neutral-100 overflow-hidden"
                                >
                                    <RemoteImage src={item.image_url} alt={item.name} sizes="128px" />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between gap-4">
                                        <div>
                                            <p className="font-semibold line-clamp-1">{item.name}</p>
                                            {item.size_label && (
                                                <p className="text-xs text-muted-foreground">Size: {item.size_label}</p>
                                            )}
                                            <span className="mt-1 inline-block border border-black text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5">
                                                {isPO ? 'Pre-Order' : 'Ready'}
                                            </span>
                                        </div>
                                        <p className="font-semibold whitespace-nowrap">
                                            <LineTotal
                                                paid={cartUnitPrice(item, currency) * item.quantity}
                                                original={cartBasePrice(item, currency) * item.quantity}
                                                currency={currency}
                                            />
                                        </p>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="flex items-center border border-black/30">
                                            <button
                                                className="p-2 disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                                onClick={() => setQuantity(item.key, item.quantity - 1)}
                                                aria-label="Decrease"
                                            >
                                                <Minus className="size-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                                            <button
                                                className="p-2 disabled:opacity-30"
                                                disabled={item.stock !== undefined && item.quantity >= item.stock}
                                                onClick={() => setQuantity(item.key, item.quantity + 1)}
                                                aria-label="Increase"
                                            >
                                                <Plus className="size-3" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => remove(item.key)}
                                            className="p-2 text-muted-foreground hover:text-black"
                                            aria-label="Remove"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <aside className="border border-black p-6 h-fit">
                    <p className="text-xs font-bold uppercase tracking-widest">Summary</p>
                    <div className="mt-4 flex justify-between text-sm">
                        <span>Subtotal ({count} items)</span>
                        <span className="font-semibold">{formatPrice(subtotal, currency)}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Shipping is calculated at checkout. Orders shipping outside Indonesia are priced in USD.
                    </p>
                    <Button
                        asChild
                        variant="primary"
                        width="full"
                        className="mt-6 h-12 rounded-none text-xs font-bold tracking-widest uppercase"
                    >
                        <Link href="/checkout">Checkout</Link>
                    </Button>
                </aside>
            </div>
        </div>
    );
}
