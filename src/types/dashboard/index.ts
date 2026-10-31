import type { Currency } from '@/lib/utils';
import type { OrderStatus } from '../order';

export interface DashboardSummary {
    total_revenue: number;
    month_revenue: number;
    month_orders: number;
    product_count: number;
    orders_by_status: Partial<Record<OrderStatus, number>>;
    daily_sales: { date: string; revenue: number; orders: number }[];
    top_products: { name: string; quantity: number }[];
    low_stock: { id: string; name: string; stock: number }[];
    recent_orders: {
        id: string;
        orderNo: string;
        customerName: string;
        total: number;
        currency: Currency;
        status: OrderStatus;
        createdAt: string;
    }[];
}

export interface FinanceSummary {
    received_total: number;
    received_subtotal: number;
    received_shipping: number;
    received_count: number;
    refund_due_total: number;
    refund_due_count: number;
    pending_payment_total: number;
    pending_payment_count: number;
    by_method: { payment_type: string; total: number; count: number }[];
    midtrans_dashboard_url: string;
}
