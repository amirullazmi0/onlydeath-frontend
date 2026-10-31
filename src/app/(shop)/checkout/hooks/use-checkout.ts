import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import useMutationApiRequest from '@/hooks/react-query/useMutationApiRequest';
import { useIndonesiaRegions, type RegionOption } from '@/hooks/useIndonesiaRegions';
import { openMidtransSnap } from '@/lib/midtrans';
import { cartTotals, useCartStore } from '@/stores/cart.store';
import { useCurrencyStore } from '@/stores/currency.store';
import type { Currency } from '@/lib/utils';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { CheckoutRequest, CheckoutResponse, CourierRate, RatesRequest } from '@/types/order';
import { checkoutSchema, CheckoutFormData, courierKey, type Destination } from '../checkout.config';

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
    const destination = form.watch('destination') as Destination | undefined;
    const isDomestic = destination === 'ID';

    // Prices differ per currency, so nothing is priced until the buyer chooses:
    // Indonesia pays in IDR, every other country in USD.
    const setDisplayCurrency = useCurrencyStore((s) => s.setCurrency);
    const currency: Currency | null = destination ? (isDomestic ? 'IDR' : 'USD') : null;
    const subtotal = currency ? cartTotals(items, currency).subtotal : 0;
    // The server refuses these abroad; say so before the buyer fills in the form
    const usdUnavailable = destination === 'INTL' ? items.filter((i) => i.price_usd_cents <= 0) : [];

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
        // A quote for the previous region no longer applies
        if (level !== 'village') fetchRates();
    };

    // ---- Shipping rates (quoted by postal code for every country) ----
    const [rates, setRates] = useState<CourierRate[]>([]);
    const ratesMutation = useMutationApiRequest<GlobalApiResponse<CourierRate[]>, RatesRequest>({
        key: 'shipping-rates',
        config: { showLoading: false, successNotification: false, errorNotification: true },
        options: { onSuccess: (res) => setRates(res?.data ?? []) },
    });

    function fetchRates() {
        const { country_code, postal_code, city, district } = form.getValues();
        form.setValue('courier_key', '');
        setRates([]);
        const postal = postal_code.trim();
        if (!country_code || !postalValid(country_code, postal)) return;
        if (country_code !== 'ID') {
            ratesMutation.mutate({ country_code, postal_code: postal, items: cartItems });
        } else if (city && district) {
            // The server checks the postal code against the region, so wait for both
            ratesMutation.mutate({ country_code, postal_code: postal, city, district, items: cartItems });
        }
    }

    /** Region names from one country make no sense in another */
    const resetAddress = () => {
        (['state', 'city', 'district', 'sub_district'] as const).forEach((f) => form.setValue(f, ''));
        setRegionIds({});
    };

    const selectDestination = (value: Destination) => {
        if (value === destination) return;
        form.setValue('destination', value, { shouldValidate: true });
        form.setValue('country_code', value === 'ID' ? 'ID' : '');
        form.setValue('postal_code', '');
        form.setValue('courier_key', '');
        form.clearErrors();
        resetAddress();
        setRates([]);
        setDisplayCurrency(value === 'ID' ? 'IDR' : 'USD');
    };

    const selectCountry = (code: string) => {
        form.setValue('country_code', code, { shouldValidate: true });
        resetAddress();
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
        const { courier_key, destination: chosen, ...rest } = data;
        const [courier_code, courier_service] = courier_key.split('|');

        checkoutMutation.mutate(
            {
                ...rest,
                currency: chosen === 'ID' ? 'IDR' : 'USD',
                postal_code: rest.postal_code.trim(),
                courier_code,
                courier_service,
                items: cartItems,
            },
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
        destination,
        isDomestic,
        usdUnavailable,
        selectDestination,
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
