import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Currency } from '@/lib/utils';
import { applyDiscount } from '@/lib/pricing';
import type { ProductAvailability } from '@/types/product';

export interface CartItem {
    /** product_id + size_id: the same product in two sizes is two lines */
    key: string;
    product_id: string;
    size_id?: string;
    size_label?: string;
    slug: string;
    name: string;
    image_url?: string;
    /** IDR, whole rupiah, before discount */
    price: number;
    /** USD cents, before discount */
    price_usd_cents: number;
    /** Best active discount when added; the server re-checks at checkout */
    discount_pct: number;
    availability: ProductAvailability;
    /** Max purchasable for READY items (per size when sized); undefined for PO. */
    stock?: number;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    add: (item: Omit<CartItem, 'quantity' | 'key'>, quantity?: number) => void;
    setQuantity: (key: string, quantity: number) => void;
    remove: (key: string) => void;
    clear: () => void;
}

export const cartKey = (productId: string, sizeId?: string) => `${productId}:${sizeId ?? ''}`;

const clamp = (item: Pick<CartItem, 'stock'>, quantity: number) =>
    Math.max(1, item.stock === undefined ? quantity : Math.min(quantity, item.stock));

/** Guest cart: buyers never log in, so the cart lives in localStorage. */
export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],

            add: (item, quantity = 1) =>
                set((state) => {
                    const key = cartKey(item.product_id, item.size_id);
                    const existing = state.items.find((i) => i.key === key);
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.key === key
                                    ? { ...i, ...item, quantity: clamp(item, i.quantity + quantity) }
                                    : i,
                            ),
                        };
                    }
                    return { items: [...state.items, { ...item, key, quantity: clamp(item, quantity) }] };
                }),

            setQuantity: (key, quantity) =>
                set((state) => ({
                    items: state.items.map((i) => (i.key === key ? { ...i, quantity: clamp(i, quantity) } : i)),
                })),

            remove: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

            clear: () => set({ items: [] }),
        }),
        // Bumping the version drops carts saved in an older shape
        { name: 'onlydeath-cart', version: 3 },
    ),
);

/** Unit price before discount */
export const cartBasePrice = (item: CartItem, currency: Currency) =>
    currency === 'USD' ? item.price_usd_cents : item.price;

/** Unit price the buyer pays */
export const cartUnitPrice = (item: CartItem, currency: Currency) =>
    applyDiscount(cartBasePrice(item, currency), item.discount_pct ?? 0);

export const cartTotals = (items: CartItem[], currency: Currency = 'IDR') => ({
    count: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: items.reduce((sum, i) => sum + cartUnitPrice(i, currency) * i.quantity, 0),
});
