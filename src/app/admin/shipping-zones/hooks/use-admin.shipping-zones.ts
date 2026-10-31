import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import useMutationApiRequest from '@/hooks/react-query/useMutationApiRequest';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { ShippingZone, UpsertShippingZoneRequest } from '@/types/order';

const zoneSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    countries: yup.array(yup.string().required()).min(1, 'Pick at least one country').required(),
    // Entered in US dollars, sent to the API as cents
    base_usd: yup.number().typeError('Required').required().min(0),
    per_kg_usd: yup.number().typeError('Required').required().min(0),
    eta_text: yup.string().required('ETA is required'),
    is_active: yup.boolean().required(),
});

export type ZoneFormData = yup.InferType<typeof zoneSchema>;

const EMPTY: ZoneFormData = {
    name: '',
    countries: [],
    base_usd: 0,
    per_kg_usd: 0,
    eta_text: '7-14 days',
    is_active: true,
};

export default function useAdminShippingZones() {
    // null = closed, {} = create, zone = edit
    const [editing, setEditing] = useState<Partial<ShippingZone> | null>(null);
    const [deleting, setDeleting] = useState<ShippingZone | null>(null);
    const form = useForm<ZoneFormData>({ resolver: yupResolver(zoneSchema), defaultValues: EMPTY });

    const { data, isLoading } = useQueryApiRequest<GlobalApiResponse<ShippingZone[]>>({
        key: 'shipping-zones',
    });

    const saveMutation = useMutationApiRequest<GlobalApiResponse<ShippingZone>, UpsertShippingZoneRequest>({
        key: editing?.id ? 'update-shipping-zone' : 'create-shipping-zone',
        params: () => ({ id: editing?.id ?? '' }),
        options: { onSuccess: () => setEditing(null) },
    });
    const deleteMutation = useMutationApiRequest<GlobalApiResponse<null>, void>({
        key: 'delete-shipping-zone',
        params: () => ({ id: deleting?.id ?? '' }),
        options: { onSuccess: () => setDeleting(null) },
    });

    const openForm = (zone: Partial<ShippingZone>) => {
        setEditing(zone);
        form.reset(
            zone.id
                ? {
                      name: zone.name ?? '',
                      countries: zone.countries ?? [],
                      base_usd: (zone.baseRateCents ?? 0) / 100,
                      per_kg_usd: (zone.perKgRateCents ?? 0) / 100,
                      eta_text: zone.etaText ?? '',
                      is_active: zone.isActive ?? true,
                  }
                : EMPTY,
        );
    };

    return {
        zones: data?.data ?? [],
        isLoading,
        editing,
        openForm,
        closeForm: () => setEditing(null),
        form,
        onSave: form.handleSubmit(({ base_usd, per_kg_usd, ...rest }) =>
            saveMutation.mutate({
                ...rest,
                base_rate_cents: Math.round(base_usd * 100),
                per_kg_rate_cents: Math.round(per_kg_usd * 100),
            }),
        ),
        saving: saveMutation.isPending,
        deleting,
        setDeleting,
        confirmDelete: () => deleteMutation.mutate(),
        isDeleting: deleteMutation.isPending,
    };
}
