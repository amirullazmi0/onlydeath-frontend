import { cn } from '@/lib/utils';
import { ORDER_STATUS_LABEL, type OrderStatus } from '@/types/order';

// Monochrome: solid for states needing admin action, outlined/greyed otherwise
const STYLE: Record<OrderStatus, string> = {
    PENDING_PAYMENT: 'border-black/30 text-neutral-500',
    PAID: 'bg-black text-white border-black',
    CONFIRMED: 'bg-neutral-700 text-white border-neutral-700',
    SHIPPED: 'border-black text-black',
    DELIVERED: 'border-black text-black bg-neutral-100',
    REJECTED: 'border-black/30 text-neutral-400 line-through',
    EXPIRED: 'border-black/20 text-neutral-400',
    CANCELLED: 'border-black/20 text-neutral-400',
};

export default function OrderStatusBadge({ status }: Readonly<{ status: OrderStatus }>) {
    return (
        <span
            className={cn(
                'inline-block border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap',
                STYLE[status],
            )}
        >
            {ORDER_STATUS_LABEL[status]}
        </span>
    );
}
