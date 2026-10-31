import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import useMutationApiRequest from '@/hooks/react-query/useMutationApiRequest';
import { useIndonesiaRegions, type RegionOption } from '@/hooks/useIndonesiaRegions';
import { openMidtransSnap } from '@/lib/midtrans';
import { cartTotals, useCartStore } from '@/stores/cart.store';
import { useCurrencyStore, useDisplayCurrency } from '@/stores/currency.store';
import type { Currency } from '@/lib/utils';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { CheckoutRequest, CheckoutResponse, CourierRate, RatesRequest } from '@/types/order';
import { checkoutSchema, CheckoutFormData, courierKey } from '../checkout.config';

type RegionLevel = 'province' | 'city' | 'district' | 'village';

/** Which form field each Indonesian level fills, and which deeper levels it resets. */
const LEVELS: Record<RegionLevel, { field: 'state' | 'city' | 'district' | 'sub_district'; resets: RegionLevel[] }> = {
    province: { field: 'state', resets: ['city', 'district', 'village'] },
    city: { field: 'city', resets: ['district', 'village'] },
    district: { field: 'district', resets: ['village'] },
    village: { field: 'sub_district', resets: [] },
};

const postalValid = (country: string, postal: string) =>
    country === 'ID' ? /^\d{5}$/.test(postal) : /^[A-Za-z0-9 -]{3,10}$/.test(postal);

export default function useCheckout() {
    const router = useRouter();
    const { items, clear } = useCartStore();
    const cartItems = items.map((i) => ({ product_id: i.product_id, size_id: i.size_id, quantity: i.quantity }));

    const form = useForm<CheckoutFormData>({
        resolver: yupResolver(checkoutSchema),
        mode: 'onTouched',
        defaultValues: {
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            country_code: '',
            state: '',
            city: '',
            district: '',
            sub_district: '',
            postal_code: '',
            address: '',
            note: '',
            courier_key: '',
        },
    });
    const country = form.watch('country_code');
    const isDomestic = country === 'ID';

    // Indonesia pays in IDR, every other country in USD; before a country is
    // picked, show the buyer's chosen display currency.
    const displayCurrency = useDisplayCurrency();
    const setDisplayCurrency = useCurrencyStore((s) => s.setCurrency);
    const currency: Currency = country ? (isDomestic ? 'IDR' : 'USD') : displayCurrency;
    const { subtotal } = cartTotals(items, currency);

    // ---- Indonesian region cascade (kratify flow) ----
    const [regionIds, setRegionIds] = useState<Partial<Record<RegionLevel, string>>>({});
    const regions = useIndonesiaRegions(isDomestic, {
        provinceId: regionIds.province,
        cityId: regionIds.city,
        districtId: regionIds.district,
    });

    const selectRegion = (level: RegionLevel, option: RegionOption) => {
        const { field, resets } = LEVELS[level];
        form.setValue(field, option.name, { shouldValidate: true });
        resets.forEach((r) => form.setValue(LEVELS[r].field, ''));
        setRegionIds((prev) => {
            const next = { ...prev, [level]: option.id };
            resets.forEach((r) => delete next[r]);
            return next;
        });
    };

    // ---- Shipping rates (quoted by postal code for every country) ----
    const [rates, setRates] = useState<CourierRate[]>([]);
    const ratesMutation = useMutationApiRequest<GlobalApiResponse<CourierRate[]>, RatesRequest>({
        key: 'shipping-rates',
        config: { showLoading: false, successNotification: false, errorNotification: true },
        options: { onSuccess: (res) => setRates(res?.data ?? []) },
    });

    const fetchRates = () => {
        const { country_code, postal_code } = form.getValues();
        form.setValue('courier_key', '');
        setRates([]);
        if (!country_code || !postalValid(country_code, postal_code)) return;
        ratesMutation.mutate({ country_code, postal_code, items: cartItems });
    };

    const selectCountry = (code: string) => {
        form.setValue('country_code', code, { shouldValidate: true });
        setDisplayCurrency(code === 'ID' ? 'IDR' : 'USD');
        // Region names from one country make no sense in another
        (['state', 'city', 'district', 'sub_district'] as const).forEach((f) => form.setValue(f, ''));
        setRegionIds({});
        fetchRates();
    };

    /** Re-quote as soon as the postal code is complete. */
    const onPostalChange = (value: string) => {
        if (postalValid(form.getValues('country_code'), value.trim())) fetchRates();
    };

    const selectedRate = rates.find((r) => courierKey(r) === form.watch('courier_key'));

    // ---- Checkout + Midtrans ----
    const checkoutMutation = useMutationApiRequest<GlobalApiResponse<CheckoutResponse>, CheckoutRequest>({
        key: 'checkout',
        config: { showLoading: true, successNotification: false, errorNotification: true },
    });

    const onSubmit = (data: CheckoutFormData) => {
        const { courier_key, ...rest } = data;
        const [courier_code, courier_service] = courier_key.split('|');

        checkoutMutation.mutate(
            { ...rest, postal_code: rest.postal_code.trim(), courier_code, courier_service, items: cartItems },
            {
                onSuccess: async (res) => {
                    const { order_no, snap_token, client_key } = res.data;
                    // The order exists now; the cart is no longer needed
                    clear();
                    const go = (path: string) => router.push(`${path}?order_no=${order_no}`);
                    try {
                        await openMidtransSnap(snap_token, client_key, {
                            onSuccess: () => go('/orders/success'),
                            onPending: () => go('/orders/pending'),
                            onError: () => go('/orders/error'),
                            onClose: () => {
                                toast.info('Payment not finished yet. You can continue from the Track Order page.');
                                go('/orders/pending');
                            },
                        });
                    } catch {
                        toast.error('Could not open the payment window');
                        go('/orders/pending');
                    }
                },
            },
        );
    };

    return {
        form,
        items,
        subtotal,
        currency,
        isDomestic,
        selectCountry,
        regions,
        regionIds,
        selectRegion,
        onPostalChange,
        rates,
        ratesLoading: ratesMutation.isPending,
        fetchRates,
        selectedRate,
        onSubmit: form.handleSubmit(onSubmit),
        submitting: checkoutMutation.isPending,
    };
}
