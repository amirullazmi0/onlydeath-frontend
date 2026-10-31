'use client';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input, LabelInput } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import useMutationApiRequest from '@/hooks/react-query/useMutationApiRequest';
import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { ShippingOrigin, UpdateShippingOriginRequest } from '@/types/order';

const schema = yup.object().shape({
    contact_name: yup.string().trim().required('Sender name is required').min(2, 'Name is too short'),
    phone: yup
        .string()
        .trim()
        .required('Phone number is required')
        .matches(/^(\+62|62|0)[0-9 -]{8,16}$/, 'Enter an Indonesian phone number'),
    address: yup.string().trim().required('Address is required').min(10, 'Please enter the full address'),
    postal_code: yup
        .string()
        .trim()
        .required('Postal code is required')
        .matches(/^\d{5}$/, 'Indonesian postal codes have 5 digits'),
});

export default function ShippingOriginForm() {
    const { data } = useQueryApiRequest<GlobalApiResponse<ShippingOrigin | null>>({ key: 'shipping-origin' });
    const origin = data?.data;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UpdateShippingOriginRequest>({
        resolver: yupResolver(schema),
        // Fills in once the saved address arrives
        values: {
            contact_name: origin?.contactName ?? '',
            phone: origin?.phone ?? '',
            address: origin?.address ?? '',
            postal_code: origin?.postalCode ?? '',
        },
    });

    const mutation = useMutationApiRequest<GlobalApiResponse<ShippingOrigin>, UpdateShippingOriginRequest>({
        key: 'update-shipping-origin',
    });

    return (
        <section className="bg-white border border-black/10 p-5">
            <p className="text-xs font-bold uppercase tracking-widest">Sender address</p>
            <p className="mt-2 text-xs text-muted-foreground">
                Used by Biteship for Indonesian orders. International orders ship manually.
            </p>
            <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                    <LabelInput required>Sender name</LabelInput>
                    <Input {...register('contact_name')} className="rounded-none" />
                    {errors.contact_name && <p className="text-xs text-destructive">{errors.contact_name.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <LabelInput required>Phone</LabelInput>
                    <Input {...register('phone')} inputMode="tel" className="rounded-none" />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <LabelInput required>Address</LabelInput>
                    <Textarea {...register('address')} className="rounded-none" />
                    {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <LabelInput required>Postal code</LabelInput>
                    <Input {...register('postal_code')} inputMode="numeric" maxLength={5} className="rounded-none" />
                    {errors.postal_code && <p className="text-xs text-destructive">{errors.postal_code.message}</p>}
                </div>
                <Button type="submit" variant="primary" disabled={mutation.isPending} className="rounded-none text-xs font-bold uppercase">
                    {mutation.isPending ? <Spinner /> : 'Save Address'}
                </Button>
            </form>
        </section>
    );
}
