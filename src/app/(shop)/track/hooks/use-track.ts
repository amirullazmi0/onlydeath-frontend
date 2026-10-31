import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import useMutationApiRequest from '@/hooks/react-query/useMutationApiRequest';
import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import { openMidtransSnap } from '@/lib/midtrans';
import { useCartStore } from '@/stores/cart.store';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { CancelOrderRequest, CancelOrderResponse, TrackOrderResponse } from '@/types/order';

const trackSchema = yup.object().shape({
    order_no: yup.string().required('Order number is required'),
    email: yup.string().required('Email is required').email('Invalid email'),
});

type TrackFormData = yup.InferType<typeof trackSchema>;

export default function useTrack() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const addToCart = useCartStore((s) => s.add);
    const orderNo = searchParams.get('order_no') ?? '';
    const email = searchParams.get('email') ?? '';
    // Links from our emails carry both, so the order opens without retyping them
    const [query, setQuery] = useState<TrackFormData | null>(
        orderNo && email ? { order_no: orderNo.toUpperCase(), email } : null,
    );
    const [cancelOpen, setCancelOpen] = useState(searchParams.get('action') === 'cancel');

    const form = useForm<TrackFormData>({
        resolver: yupResolver(trackSchema),
        defaultValues: { order_no: orderNo, email },
    });

    const { data, isFetching, refetch } = useQueryApiRequest<GlobalApiResponse<TrackOrderResponse>>({
        key: 'order-track',
        queries: query ?? undefined,
        options: { enabled: !!query, retry: false },
    });

    const onSubmit = form.handleSubmit((values) => {
        const next = { order_no: values.order_no.trim().toUpperCase(), email: values.email.trim() };
        if (query && query.order_no === next.order_no && query.email === next.email) refetch();
        else setQuery(next);
    });

    const order = query ? data?.data : undefined;

    const payNow = async () => {
        if (!order?.payment) return;
        const { snap_token, client_key } = order.payment;
        const go = (path: string) => router.push(`${path}?order_no=${order.order_no}`);
        try {
            await openMidtransSnap(snap_token, client_key, {
                onSuccess: () => go('/orders/success'),
                onPending: () => refetch(),
                onError: () => go('/orders/error'),
            });
        } catch {
            toast.error('Could not open the payment window');
        }
    };

    const cancelMutation = useMutationApiRequest<GlobalApiResponse<CancelOrderResponse>, CancelOrderRequest>({
        key: 'cancel-order',
        options: {
            onSuccess: (res) => {
                res?.data.cart_items.forEach(({ quantity, ...item }) => addToCart(item, quantity));
                setCancelOpen(false);
                router.push('/cart');
            },
            // Usually paid in the meantime; show the current status
            onError: () => {
                setCancelOpen(false);
                refetch();
            },
        },
    });

    const cancelOrder = () => {
        if (order) cancelMutation.mutate({ order_no: order.order_no, email: order.customer_email });
    };

    return {
        form,
        onSubmit,
        order,
        isFetching,
        payNow,
        // A cancel link on an order that is already paid simply shows its status
        cancelOpen: cancelOpen && order?.status === 'PENDING_PAYMENT',
        setCancelOpen,
        cancelOrder,
        cancelling: cancelMutation.isPending,
    };
}
