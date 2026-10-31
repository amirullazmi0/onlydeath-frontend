import type { Currency } from '@/lib/utils';
import type { ProductAvailability } from '../product';

export type OrderStatus =
    | 'PENDING_PAYMENT'
    | 'PAID'
    | 'CONFIRMED'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'REJECTED'
    | 'EXPIRED'
    | 'CANCELLED';

export type ShippingType = 'DOMESTIC' | 'INTERNATIONAL';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
    PENDING_PAYMENT: 'Awaiting Payment',
    PAID: 'Paid',
    CONFIRMED: 'Confirmed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    REJECTED: 'Rejected',
    EXPIRED: 'Expired',
    CANCELLED: 'Cancelled',
};

export interface Area {
    id: string;
    name: string;
    postal_code: number;
}

export interface CourierRate {
    courier_code: string;
    courier_service_code: string;
    courier_name: string;
    courier_service_name: string;
    description: string;
    duration: string;
    /** Minor units of `currency`: IDR for Indonesia, USD cents abroad */
    price: number;
    currency: Currency;
}

export interface CartItemRequest {
    product_id: string;
    size_id?: string;
    quantity: number;
}

export interface RatesRequest {
    country_code: string;
    area_id?: string;
    postal_code: string;
    items: CartItemRequest[];
}

export interface CheckoutRequest {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    country_code: string;
    address: string;
    city: string;
    /** Province (ID) or state/province */
    state: string;
    /** Kecamatan (ID) or district/area */
    district: string;
    /** Kelurahan (ID) or sub-district */
    sub_district: string;
    postal_code: string;
    note?: string;
    courier_code: string;
    courier_service: string;
    items: CartItemRequest[];
}

export interface CheckoutResponse {
    order_no: string;
    snap_token: string;
    redirect_url: string | null;
    client_key: string;
}

export interface TrackingHistory {
    note: string;
    status: string;
    updated_at: string;
}

export interface StoreInfo {
    name: string;
    tagline: string;
    address: string;
    phone: string;
    email: string;
    website: string;
}

export interface TrackOrderResponse {
    order_no: string;
    customer_email: string;
    customer_phone: string;
    paid_at: string | null;
    payment_method: string | null;
    exchange_rate: string;
    store: StoreInfo;
    status: OrderStatus;
    status_label: string;
    shipping_type: ShippingType;
    customer_name: string;
    address: string;
    city: string;
    state: string | null;
    district: string | null;
    sub_district: string | null;
    area_name: string | null;
    postal_code: string;
    country_code: string;
    country_name: string;
    courier_name: string;
    waybill: string | null;
    tracking_url: string | null;
    subtotal: number;
    shipping_cost: number;
    total: number;
    /** subtotal/shipping/total/item prices are in this currency */
    currency: Currency;
    discount_total: number;
    /** IDR amount actually charged by Midtrans */
    charge_total: number;
    reject_reason: string | null;
    created_at: string;
    items: {
        name: string;
        size_label: string | null;
        image_url: string | null;
        /** Discounted unit price */
        price: number;
        original_price: number;
        discount_pct: number;
        quantity: number;
        availability: ProductAvailability;
    }[];
    logs: { status: OrderStatus; note: string | null; created_at: string }[];
    payment: { snap_token: string; redirect_url: string | null; client_key: string } | null;
    tracking: {
        status: string;
        waybill_id: string;
        courier: { company: string; driver_name?: string; driver_phone?: string };
        history: TrackingHistory[];
    } | null;
}

export interface OrderItem {
    id: string;
    productId: string | null;
    sizeLabel: string | null;
    name: string;
    imageUrl: string | null;
    /** Discounted unit price */
    price: number;
    originalPrice: number;
    discountPct: number;
    quantity: number;
    weightGram: number;
    availability: ProductAvailability;
}

export interface Order {
    id: string;
    orderNo: string;
    status: OrderStatus;
    shippingType: ShippingType;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    countryCode: string;
    address: string;
    city: string;
    state: string | null;
    district: string | null;
    subDistrict: string | null;
    areaName: string | null;
    postalCode: string;
    note: string | null;
    courierName: string;
    subtotal: number;
    shippingCost: number;
    total: number;
    discountTotal: number;
    currency: Currency;
    exchangeRate: string;
    chargeTotal: number;
    chargeShipping: number;
    rejectReason: string | null;
    waybill: string | null;
    trackingUrl: string | null;
    paidAt: string | null;
    createdAt: string;
    items: OrderItem[];
    payment: {
        paymentType: string | null;
        transactionStatus?: string | null;
        paidAt?: string | null;
    } | null;
    logs?: { id: string; status: OrderStatus; note: string | null; actor: string | null; createdAt: string }[];
}

export interface ShippingZone {
    id: string;
    name: string;
    countries: string[];
    /** USD cents */
    baseRateCents: number;
    perKgRateCents: number;
    etaText: string;
    isActive: boolean;
}

export interface UpsertShippingZoneRequest {
    name: string;
    countries: string[];
    base_rate_cents: number;
    per_kg_rate_cents: number;
    eta_text: string;
    is_active?: boolean;
}

export interface ManualShipRequest {
    courier_name?: string;
    tracking_number?: string;
    tracking_url?: string;
}
