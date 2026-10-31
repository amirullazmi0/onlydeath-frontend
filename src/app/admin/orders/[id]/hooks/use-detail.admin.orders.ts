import { useState } from 'react';
import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import useMutationApiRequest from '@/hooks/react-query/useMutationApiRequest';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { ManualShipRequest, Order } from '@/types/order';

export type OrderAction = 'confirm' | 'ship' | 'deliver' | 'reject';

export default function useDetailAdminOrder(id: string) {
    const [action, setAction] = useState<OrderAction | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [shipForm, setShipForm] = useState<ManualShipRequest>({
        courier_name: '',
        tracking_number: '',
        tracking_url: '',
    });

    const { data, isLoading } = useQueryApiRequest<GlobalApiResponse<Order>>({
        key: 'order-by-id',
        params: { id },
    });

    const params = { id };
    const close = { onSuccess: () => setAction(null) };
    const confirmM = useMutationApiRequest<GlobalApiResponse<Order>, void>({ key: 'confirm-order', params, options: close });
    const shipM = useMutationApiRequest<GlobalApiResponse<Order>, ManualShipRequest>({ key: 'ship-order', params, options: close });
    const deliverM = useMutationApiRequest<GlobalApiResponse<Order>, void>({ key: 'deliver-order', params, options: close });
    const rejectM = useMutationApiRequest<GlobalApiResponse<Order>, { reason: string }>({
        key: 'reject-order',
        params,
        options: close,
    });

    const order = data?.data;

    const submit = () => {
        if (action === 'confirm') confirmM.mutate();
        if (action === 'deliver') deliverM.mutate();
        if (action === 'reject') rejectM.mutate({ reason: rejectReason.trim() });
        if (action === 'ship') {
            shipM.mutate(
                order?.shippingType === 'INTERNATIONAL'
                    ? {
                          courier_name: shipForm.courier_name?.trim(),
                          tracking_number: shipForm.tracking_number?.trim(),
                          tracking_url: shipForm.tracking_url?.trim() || undefined,
                      }
                    : {},
            );
        }
    };

    return {
        order,
        isLoading,
        action,
        setAction,
        rejectReason,
        setRejectReason,
        shipForm,
        setShipForm,
        submit,
        submitting: confirmM.isPending || shipM.isPending || deliverM.isPending || rejectM.isPending,
    };
}
