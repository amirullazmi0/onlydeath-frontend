'use client';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { Input, LabelInput } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import SearchableSelect from '@/components/custom/searchable-select';
import type { RegionOption } from '@/hooks/useIndonesiaRegions';
import { useHydrated } from '@/hooks/useHydrated';
import { COUNTRIES } from '@/lib/countries';
import { cn, formatPrice } from '@/lib/utils';
import { cartBasePrice, cartUnitPrice } from '@/stores/cart.store';
import { LineTotal } from '@/components/shop/price';
import useCheckout from './hooks/use-checkout';
import { courierKey } from './checkout.config';

const FieldError = ({ message }: { message?: string }) =>
    message ? <p className="text-xs text-destructive mt-1">{message}</p> : null;

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));

function RegionField({
    label,
    options,
    value,
    onSelect,
    loading,
    disabled,
    placeholder,
    error,
}: Readonly<{
    label: string;
    options: RegionOption[];
    value?: string;
    onSelect: (option: RegionOption) => void;
    loading?: boolean;
    disabled?: boolean;
    placeholder: string;
    error?: string;
}>) {
    return (
        <div className="space-y-1.5">
            <LabelInput required>{label}</LabelInput>
            <SearchableSelect
                options={options.map((o) => ({ value: o.id, label: o.name }))}
                value={value}
                onChange={(id) => {
                    const option = options.find((o) => o.id === id);
                    if (option) onSelect(option);
                }}
                loading={loading}
                disabled={disabled}
                placeholder={placeholder}
                searchPlaceholder={`Search ${label.toLowerCase()}...`}
            />
            <FieldError message={error} />
        </div>
    );
}

const SectionTitle = ({ no, children }: { no: string; children: React.ReactNode }) => (
    <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
        <span className="size-6 bg-black text-white flex items-center justify-center">{no}</span>
        {children}
    </p>
);

export default function CheckoutView() {
    const hydrated = useHydrated();
    const {
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
        ratesLoading,
        fetchRates,
        selectedRate,
        onSubmit,
        submitting,
    } = useCheckout();
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = form;

    if (!hydrated) return <div className="min-h-[50vh]" />;

    if (items.length === 0) {
        return (
            <div className="py-32 text-center">
                <p className="text-2xl font-black uppercase">Your cart is empty</p>
                <Link href="/catalog" className="mt-6 inline-block text-xs font-bold uppercase underline">
                    Back to shop
                </Link>
            </div>
        );
    }

    const country = watch('country_code');
    const hasPO = items.some((i) => i.availability === 'PRE_ORDER');

    return (
        <form onSubmit={onSubmit} className="mx-auto max-w-7xl px-4 md:px-8 py-10">
            <h1 className="text-3xl font-black uppercase tracking-tight">Checkout</h1>

            <div className="mt-8 grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* Contact */}
                    <section className="space-y-4">
                        <SectionTitle no="1">Contact</SectionTitle>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <LabelInput required>Full Name</LabelInput>
                                <Input {...register('customer_name')} className="rounded-none" />
                                <FieldError message={errors.customer_name?.message} />
                            </div>
                            <div className="space-y-1.5">
                                <LabelInput required>Phone</LabelInput>
                                <Input
                                    {...register('customer_phone')}
                                    placeholder="+62 812 3456 7890"
                                    className="rounded-none"
                                />
                                <FieldError message={errors.customer_phone?.message} />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <LabelInput required>Email</LabelInput>
                                <Input type="email" {...register('customer_email')} className="rounded-none" />
                                <p className="text-xs text-muted-foreground">
                                    Your invoice and order number will be sent here.
                                </p>
                                <FieldError message={errors.customer_email?.message} />
                            </div>
                        </div>
                    </section>

                    {/* Address */}
                    <section className="space-y-4">
                        <SectionTitle no="2">Shipping Address</SectionTitle>
                        <div className="space-y-1.5">
                            <LabelInput required>Country</LabelInput>
                            <SearchableSelect
                                options={COUNTRY_OPTIONS}
                                value={country}
                                onChange={selectCountry}
                                placeholder="Select country"
                                searchPlaceholder="Search country..."
                            />
                            <FieldError message={errors.country_code?.message} />
                        </div>

                        {country && (
                            <>
                                <p className="border border-black/10 bg-neutral-50 px-3 py-2 text-xs text-muted-foreground">
                                    {isDomestic
                                        ? 'Pick your province, city, kecamatan and kelurahan from the lists.'
                                        : 'Fill in your address details as used in your country.'}
                                </p>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {isDomestic ? (
                                        <>
                                            <RegionField
                                                label="Province"
                                                options={regions.provinces}
                                                value={regionIds.province}
                                                onSelect={(o) => selectRegion('province', o)}
                                                loading={regions.loading.provinces}
                                                placeholder="Select province"
                                                error={errors.state?.message}
                                            />
                                            <RegionField
                                                label="City / Regency"
                                                options={regions.cities}
                                                value={regionIds.city}
                                                onSelect={(o) => selectRegion('city', o)}
                                                loading={regions.loading.cities}
                                                disabled={!regionIds.province}
                                                placeholder={regionIds.province ? 'Select city / regency' : 'Select province first'}
                                                error={errors.city?.message}
                                            />
                                            <RegionField
                                                label="District / Kecamatan"
                                                options={regions.districts}
                                                value={regionIds.district}
                                                onSelect={(o) => selectRegion('district', o)}
                                                loading={regions.loading.districts}
                                                disabled={!regionIds.city}
                                                placeholder={regionIds.city ? 'Select kecamatan' : 'Select city first'}
                                                error={errors.district?.message}
                                            />
                                            <RegionField
                                                label="Village / Kelurahan"
                                                options={regions.villages}
                                                value={regionIds.village}
                                                onSelect={(o) => selectRegion('village', o)}
                                                loading={regions.loading.villages}
                                                disabled={!regionIds.district}
                                                placeholder={regionIds.district ? 'Select kelurahan' : 'Select kecamatan first'}
                                                error={errors.sub_district?.message}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-1.5">
                                                <LabelInput required>State / Province</LabelInput>
                                                <Input {...register('state')} className="rounded-none" />
                                                <FieldError message={errors.state?.message} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <LabelInput required>City</LabelInput>
                                                <Input {...register('city')} className="rounded-none" />
                                                <FieldError message={errors.city?.message} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <LabelInput required>District / Area</LabelInput>
                                                <Input {...register('district')} className="rounded-none" />
                                                <FieldError message={errors.district?.message} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <LabelInput required>Sub-district / Neighborhood</LabelInput>
                                                <Input {...register('sub_district')} className="rounded-none" />
                                                <FieldError message={errors.sub_district?.message} />
                                            </div>
                                        </>
                                    )}
                                </div>
                                {regions.error && isDomestic && (
                                    <p className="text-xs text-destructive">
                                        Couldn&apos;t load the region list. Please refresh the page and try again.
                                    </p>
                                )}

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5 md:col-span-2">
                                        <LabelInput required>Street Address</LabelInput>
                                        <Textarea
                                            {...register('address')}
                                            placeholder={
                                                isDomestic
                                                    ? 'Nama jalan, nomor rumah, RT/RW, patokan'
                                                    : 'Street, building, apartment, unit'
                                            }
                                            className="rounded-none"
                                        />
                                        <FieldError message={errors.address?.message} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <LabelInput required>Postal Code</LabelInput>
                                        <Input
                                            {...register('postal_code', {
                                                onChange: (e) => onPostalChange(e.target.value),
                                            })}
                                            inputMode={isDomestic ? 'numeric' : 'text'}
                                            maxLength={isDomestic ? 5 : 10}
                                            placeholder={isDomestic ? '5 digits' : 'Postal / ZIP code'}
                                            className="rounded-none"
                                        />
                                        <FieldError message={errors.postal_code?.message} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <LabelInput>Order Note (optional)</LabelInput>
                                    <Input {...register('note')} className="rounded-none" />
                                </div>
                            </>
                        )}
                    </section>

                    {/* Shipping */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <SectionTitle no="3">Shipping Method</SectionTitle>
                            <button
                                type="button"
                                onClick={fetchRates}
                                className="flex items-center gap-1 text-xs underline"
                            >
                                <RefreshCw className="size-3" /> Calculate
                            </button>
                        </div>
                        {ratesLoading && (
                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Spinner /> Calculating shipping...
                            </p>
                        )}
                        {!ratesLoading && rates.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                {country
                                    ? 'Enter your postal code to see shipping options.'
                                    : 'Select your country and enter your postal code to see shipping options.'}
                            </p>
                        )}
                        <div className="grid md:grid-cols-2 gap-3">
                            {rates.map((r) => {
                                const key = courierKey(r);
                                const active = watch('courier_key') === key;
                                return (
                                    <button
                                        type="button"
                                        key={key}
                                        onClick={() => setValue('courier_key', key, { shouldValidate: true })}
                                        className={cn(
                                            'text-left border p-4 transition-colors',
                                            active
                                                ? 'border-black bg-black text-white'
                                                : 'border-black/20 hover:border-black',
                                        )}
                                    >
                                        <div className="flex justify-between gap-2">
                                            <p className="font-bold uppercase text-sm">
                                                {r.courier_name} · {r.courier_service_name}
                                            </p>
                                            <p className="font-semibold text-sm">{formatPrice(r.price, r.currency)}</p>
                                        </div>
                                        <p
                                            className={cn(
                                                'text-xs mt-1',
                                                active ? 'text-neutral-300' : 'text-muted-foreground',
                                            )}
                                        >
                                            Estimated {r.duration}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                        <FieldError message={errors.courier_key?.message} />
                    </section>
                </div>

                {/* Summary */}
                <aside className="border border-black p-6 h-fit lg:sticky lg:top-24">
                    <p className="text-xs font-bold uppercase tracking-widest">Your Order</p>
                    <div className="mt-4 divide-y divide-black/10">
                        {items.map((i) => (
                            <div key={i.key} className="py-3 flex justify-between gap-3 text-sm">
                                <div className="min-w-0">
                                    <p className="line-clamp-1">
                                        {i.name}
                                        {i.size_label && <span className="text-muted-foreground"> · {i.size_label}</span>}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {i.quantity} × {formatPrice(cartUnitPrice(i, currency), currency)}
                                        {i.availability === 'PRE_ORDER' && ' · PO'}
                                    </p>
                                </div>
                                <LineTotal
                                    className="whitespace-nowrap"
                                    paid={cartUnitPrice(i, currency) * i.quantity}
                                    original={cartBasePrice(i, currency) * i.quantity}
                                    currency={currency}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 space-y-2 border-t border-black pt-4 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal, currency)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{selectedRate ? formatPrice(selectedRate.price, selectedRate.currency) : '-'}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold">
                            <span>Total</span>
                            <span>{formatPrice(subtotal + (selectedRate?.price ?? 0), currency)}</span>
                        </div>
                    </div>
                    {hasPO && (
                        <p className="mt-4 text-xs text-muted-foreground">
                            This order contains pre-order items; everything ships together once
                            production is complete.
                        </p>
                    )}
                    {currency === 'USD' && (
                        <p className="mt-4 text-xs text-muted-foreground">
                            Payment is processed by Midtrans in IDR at today&apos;s exchange rate; your bank
                            converts it back to your card&apos;s currency.
                        </p>
                    )}
                    <Button
                        type="submit"
                        variant="primary"
                        width="full"
                        disabled={submitting}
                        className="mt-6 h-12 rounded-none text-xs font-bold tracking-widest uppercase"
                    >
                        {submitting ? <Spinner /> : 'Pay Now'}
                    </Button>
                </aside>
            </div>
        </form>
    );
}
