import { useState } from 'react';
import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import useMutationApiRequest from '@/hooks/react-query/useMutationApiRequest';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { ManualShipRequest, Order } from '@/types/order';
import type { UploadResponse } from '@/types/product';

export type OrderAction = 'confirm' | 'ship' | 'deliver' | 'reject';

export default function useDetailAdminOrder(id: string) {
    const [action, setAction] = useState<OrderAction | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [shipForm, setShipForm] = useState<ManualShipRequest>({
        courier_name: '',
        tracking_number: '',
        tracking_url: '',
        shipping_document_url: '',
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

    const uploadM = useMutationApiRequest<GlobalApiResponse<UploadResponse>, FormData>({
        key: 'upload-document',
        options: {
            onSuccess: (res) =>
                setShipForm((form) => ({ ...form, shipping_document_url: res?.data.url ?? '' })),
        },
    });

    const uploadDocument = (file?: File) => {
        if (!file) return;
        const body = new FormData();
        body.append('file', file);
        uploadM.mutate(body);
    };

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
                          shipping_document_url: shipForm.shipping_document_url || undefined,
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
        uploadDocument,
        uploadingDocument: uploadM.isPending,
        submit,
        submitting: confirmM.isPending || shipM.isPending || deliverM.isPending || rejectM.isPending,
    };
}
