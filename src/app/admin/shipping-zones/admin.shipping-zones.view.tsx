'use client';
import { useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import NumberInput from '@/components/custom/number-input';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, LabelInput } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminPageHeader from '@/components/admin/admin.page-header';
import CustomConfirmationModal from '@/components/custom/custom-confirmation-modal';
import { COUNTRIES, countryName } from '@/lib/countries';
import { formatPrice } from '@/lib/utils';
import useAdminShippingZones from './hooks/use-admin.shipping-zones';

// Indonesia is always quoted live by Biteship
const SELECTABLE = COUNTRIES.filter((c) => c.code !== 'ID');

export default function AdminShippingZonesView() {
    const {
        zones,
        isLoading,
        editing,
        openForm,
        closeForm,
        form,
        onSave,
        saving,
        deleting,
        setDeleting,
        confirmDelete,
        isDeleting,
    } = useAdminShippingZones();
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = form;
    const [countryQuery, setCountryQuery] = useState('');
    const selected = watch('countries');

    const filtered = useMemo(
        () => SELECTABLE.filter((c) => c.name.toLowerCase().includes(countryQuery.toLowerCase())),
        [countryQuery],
    );

    const toggleCountry = (code: string) =>
        setValue(
            'countries',
            selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code],
            { shouldValidate: true },
        );

    return (
        <div>
            <AdminPageHeader
                title="Shipping Zones"
                description="International shipping rates in USD. Indonesia uses live Biteship rates (IDR) automatically."
                action={
                    <Button variant="primary" onClick={() => openForm({})} className="rounded-none text-xs font-bold uppercase tracking-wider">
                        <Plus /> Add Zone
                    </Button>
                }
            />

            <div className="bg-white border border-black/10">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Zone</TableHead>
                            <TableHead>Countries</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>ETA</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <Skeleton className="h-10 rounded-none" />
                                </TableCell>
                            </TableRow>
                        )}
                        {zones.map((z) => (
                            <TableRow key={z.id}>
                                <TableCell className="font-medium">{z.name}</TableCell>
                                <TableCell className="max-w-xs">
                                    <span className="line-clamp-2 text-xs text-muted-foreground">
                                        {z.countries.map(countryName).join(', ')}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs tabular-nums whitespace-nowrap">
                                    {formatPrice(z.baseRateCents, 'USD')} + {formatPrice(z.perKgRateCents, 'USD')}/kg
                                </TableCell>
                                <TableCell>{z.etaText}</TableCell>
                                <TableCell className="text-xs">{z.isActive ? 'Active' : 'Inactive'}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => openForm(z)}>
                                            <Pencil />
                                        </Button>
                                        <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => setDeleting(z)}>
                                            <Trash2 />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!isLoading && zones.length === 0 && (
                    <p className="p-10 text-center text-sm text-muted-foreground">
                        No zones yet. Buyers outside Indonesia can&apos;t check out until you add one.
                    </p>
                )}
            </div>

            <Dialog open={!!editing} onOpenChange={(open) => !open && closeForm()}>
                <DialogContent className="sm:max-w-xl rounded-none max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editing?.id ? 'Edit Zone' : 'New Zone'}</DialogTitle>
                        <DialogDescription>
                            Shipping = base rate + per-kg rate × total weight (rounded up to whole kg).
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onSave} className="space-y-4">
                        <div className="space-y-1.5">
                            <LabelInput required>Zone name</LabelInput>
                            <Input {...register('name')} placeholder="e.g. Asia Pacific – EMS" className="rounded-none" />
                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <LabelInput required>Base (USD)</LabelInput>
                                <Controller
                                    control={form.control}
                                    name="base_usd"
                                    render={({ field }) => (
                                        <NumberInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} prefix="US$" decimals={2} />
                                    )}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <LabelInput required>Per kg (USD)</LabelInput>
                                <Controller
                                    control={form.control}
                                    name="per_kg_usd"
                                    render={({ field }) => (
                                        <NumberInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} prefix="US$" decimals={2} />
                                    )}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <LabelInput required>ETA</LabelInput>
                                <Input {...register('eta_text')} className="rounded-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <LabelInput required>Countries ({selected.length})</LabelInput>
                            {selected.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {selected.map((code) => (
                                        <button
                                            type="button"
                                            key={code}
                                            onClick={() => toggleCountry(code)}
                                            className="flex items-center gap-1 bg-black text-white text-xs px-2 py-0.5"
                                        >
                                            {countryName(code)} <X className="size-3" />
                                        </button>
                                    ))}
                                </div>
                            )}
                            <Input
                                value={countryQuery}
                                onChange={(e) => setCountryQuery(e.target.value)}
                                placeholder="Search countries..."
                                startIcon={<Search />}
                                className="rounded-none"
                            />
                            <div className="max-h-48 overflow-y-auto border border-black/10 divide-y divide-black/5">
                                {filtered.map((c) => (
                                    <label key={c.code} className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-neutral-50">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(c.code)}
                                            onChange={() => toggleCountry(c.code)}
                                            className="accent-black"
                                        />
                                        {c.name}
                                    </label>
                                ))}
                            </div>
                            {errors.countries && <p className="text-xs text-destructive">{errors.countries.message}</p>}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Active</span>
                            <Switch checked={watch('is_active')} onCheckedChange={(v) => setValue('is_active', v)} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeForm} className="rounded-none">
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={saving} className="rounded-none">
                                {saving ? <Spinner /> : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <CustomConfirmationModal
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                variant="danger"
                title="Delete zone?"
                description={`"${deleting?.name}" will no longer be offered at checkout.`}
                confirmText="Delete"
            />
        </div>
    );
}
