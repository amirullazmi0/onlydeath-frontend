export type ProductAvailability = 'READY' | 'PRE_ORDER';

/** ANYTIME = always open (made per order); PERIOD = open between poStartAt and poEndAt */
export type PreOrderMode = 'ANYTIME' | 'PERIOD';

export interface ProductDiscount {
    id: string;
    name: string;
    discountPct: number;
    startAt: string | null;
    endAt: string | null;
    isActive: boolean;
}

export interface ProductSize {
    id: string;
    label: string;
    stock: number;
    sort: number;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    _count?: { products: number };
}

export interface ProductImage {
    id: string;
    url: string;
    fileId: string | null;
    sort: number;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    /** IDR, whole rupiah */
    price: number;
    /** USD cents, for buyers outside Indonesia */
    priceUsdCents: number;
    weightGram: number;
    stock: number;
    availability: ProductAvailability;
    poEstimateDays: number | null;
    poMode: PreOrderMode | null;
    poStartAt: string | null;
    poEndAt: string | null;
    sizes: ProductSize[];
    discounts: ProductDiscount[];
    isActive: boolean;
    categoryId: string | null;
    category: Pick<Category, 'id' | 'name' | 'slug'> | null;
    images: ProductImage[];
    createdAt: string;
}

export interface UpsertProductRequest {
    name: string;
    description?: string;
    category_id?: string | null;
    price: number;
    price_usd_cents: number;
    weight_gram: number;
    stock: number;
    availability: ProductAvailability;
    po_estimate_days?: number;
    po_mode?: PreOrderMode;
    po_start_at?: string;
    po_end_at?: string;
    is_active?: boolean;
    images: { url: string; file_id?: string }[];
    sizes: { id?: string; label: string; stock: number }[];
    discounts: {
        id?: string;
        name: string;
        discount_pct: number;
        start_at?: string;
        end_at?: string;
        is_active: boolean;
    }[];
}

export interface UploadResponse {
    url: string;
    file_id?: string;
}
