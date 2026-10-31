'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { ChevronLeft, ImagePlus, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, LabelInput } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import AdminPageHeader from '@/components/admin/admin.page-header';
import { cn } from '@/lib/utils';
import MarkdownEditor from '@/components/custom/markdown-editor';
import RemoteImage from '@/components/custom/remote-image';
import NumberInput from '@/components/custom/number-input';
import ImageLightbox from '@/components/custom/image-lightbox';
import useUpsertAdminProduct from '../hooks/use-upsert.admin.products';
import SizesEditor from './sizes-editor.admin.products';
import DiscountsEditor from './discounts-editor.admin.products';

const FieldError = ({ message }: { message?: string }) =>
    message ? <p className="text-xs text-destructive">{message}</p> : null;

const NO_CATEGORY = 'none';

export default function FormUpsertAdminProduct({ id }: Readonly<{ id?: string }>) {
    const {
        form,
        isEdit,
        detailLoading,
        categories,
        images,
        sizes,
        addSize,
        applyPreset,
        updateSize,
        removeSize,
        discounts,
        addDiscount,
        updateDiscount,
        removeDiscount,
        uploadFiles,
        uploading,
        removeImage,
        makeCover,
        onSubmit,
        saving,
    } = useUpsertAdminProduct(id);
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = form;
    const availability = watch('availability');
    const poMode = watch('po_mode');
    const [preview, setPreview] = useState<number | null>(null);

    if (detailLoading) return <Skeleton className="h-96 rounded-none" />;

    return (
        <form onSubmit={onSubmit}>
            <Link
                href={isEdit ? `/admin/products/${id}` : '/admin/products'}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase mb-4"
            >
                <ChevronLeft className="size-4" /> {isEdit ? 'Product detail' : 'Products'}
            </Link>
            <AdminPageHeader
                title={isEdit ? 'Edit Product' : 'New Product'}
                action={
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={saving || uploading}
                        className="rounded-none text-xs font-bold uppercase tracking-wider"
                    >
                        {saving ? <Spinner /> : 'Save Product'}
                    </Button>
                }
            />

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white border border-black/10 p-5 space-y-4">
                        <div className="space-y-1.5">
                            <LabelInput required>Name</LabelInput>
                            <Input {...register('name')} className="rounded-none" />
                            <FieldError message={errors.name?.message} />
                        </div>
                        <div className="space-y-1.5">
                            <LabelInput>Description</LabelInput>
                            <MarkdownEditor
                                value={watch('description') ?? ''}
                                onChange={(v) => setValue('description', v)}
                                placeholder={'Heavyweight cotton tee.\n\n- 280 GSM cotton\n- Boxy fit\n\n1. Wash cold\n2. Do not tumble dry'}
                            />
                        </div>
                    </section>

                    <section className="bg-white border border-black/10 p-5">
                        <p className="text-xs font-bold uppercase tracking-widest">Images</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            JPG, PNG or WEBP up to 5MB. Square (1:1) works best. The first image is the cover; click
                            an image to preview.
                        </p>
                        <ImageLightbox images={images.map((img) => img.url)} index={preview} onIndexChange={setPreview} />
                        <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-3">
                            {images.map((img, i) => (
                                <div key={img.url} className="relative aspect-square bg-neutral-100 group">
                                    <button
                                        type="button"
                                        onClick={() => setPreview(i)}
                                        aria-label={`Preview image ${i + 1}`}
                                        className="absolute inset-0 cursor-zoom-in"
                                    >
                                        <RemoteImage src={img.url} alt="" sizes="160px" fit="contain" />
                                    </button>
                                    {i === 0 && (
                                        <span className="pointer-events-none absolute bottom-1 left-1 bg-black text-white text-[9px] font-bold uppercase px-1">
                                            Cover
                                        </span>
                                    )}
                                    <div className="absolute top-1 right-1 z-10 flex gap-1 opacity-0 group-hover:opacity-100">
                                        {i > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => makeCover(i)}
                                                className="size-6 bg-white flex items-center justify-center"
                                                aria-label="Make cover"
                                            >
                                                <Star className="size-3" />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="size-6 bg-black text-white flex items-center justify-center"
                                            aria-label="Remove image"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <label className="aspect-square border-2 border-dashed border-black/20 hover:border-black flex flex-col items-center justify-center gap-1 cursor-pointer text-xs text-muted-foreground">
                                {uploading ? <Spinner /> : <ImagePlus className="size-5" />}
                                {uploading ? 'Uploading' : 'Add image'}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    className="hidden"
                                    disabled={uploading}
                                    onChange={(e) => {
                                        uploadFiles(e.target.files);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                        </div>
                    </section>

                    <SizesEditor
                        sizes={sizes}
                        isPreOrder={availability === 'PRE_ORDER'}
                        onAdd={addSize}
                        onPreset={applyPreset}
                        onChange={updateSize}
                        onRemove={removeSize}
                    />

                    <DiscountsEditor
                        discounts={discounts}
                        onAdd={addDiscount}
                        onChange={updateDiscount}
                        onRemove={removeDiscount}
                    />
                </div>

                <div className="space-y-6">
                    <section className="bg-white border border-black/10 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold">Visible in store</p>
                                <p className="text-xs text-muted-foreground">Hidden products can&apos;t be bought.</p>
                            </div>
                            <Switch
                                checked={watch('is_active')}
                                onCheckedChange={(v) => setValue('is_active', v)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <LabelInput>Category</LabelInput>
                            {/* Radix Select can't use an empty value, so "none" stands for uncategorized */}
                            <Select
                                value={watch('category_id') || NO_CATEGORY}
                                onValueChange={(v) => setValue('category_id', v === NO_CATEGORY ? '' : v)}
                            >
                                <SelectTrigger className="w-full rounded-none">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none">
                                    <SelectItem value={NO_CATEGORY}>Uncategorized</SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </section>

                    <section className="bg-white border border-black/10 p-5 space-y-4">
                        <div className="space-y-1.5">
                            <LabelInput required>Availability</LabelInput>
                            <div className="grid grid-cols-2">
                                {(['READY', 'PRE_ORDER'] as const).map((v) => (
                                    <button
                                        type="button"
                                        key={v}
                                        onClick={() => setValue('availability', v, { shouldValidate: true })}
                                        className={cn(
                                            'py-2 text-xs font-bold uppercase tracking-wider border',
                                            availability === v ? 'bg-black text-white border-black' : 'border-black/20',
                                        )}
                                    >
                                        {v === 'READY' ? 'Ready Stock' : 'Pre-Order'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {availability === 'PRE_ORDER' ? (
                            <>
                                <div className="space-y-1.5">
                                    <LabelInput required>Pre-order type</LabelInput>
                                    <div className="grid grid-cols-2">
                                        {(['ANYTIME', 'PERIOD'] as const).map((m) => (
                                            <button
                                                type="button"
                                                key={m}
                                                onClick={() => setValue('po_mode', m, { shouldValidate: true })}
                                                className={cn(
                                                    'py-2 text-xs font-bold uppercase tracking-wider border',
                                                    poMode === m ? 'bg-black text-white border-black' : 'border-black/20',
                                                )}
                                            >
                                                {m === 'ANYTIME' ? 'Anytime' : 'Period'}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {poMode === 'PERIOD'
                                            ? 'Orders are only accepted between the dates below.'
                                            : 'Always open; each order is made individually.'}
                                    </p>
                                </div>
                                {poMode === 'PERIOD' && (
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="space-y-1.5">
                                            <LabelInput required>Opens</LabelInput>
                                            <Input type="datetime-local" {...register('po_start_at')} className="rounded-none" />
                                            <FieldError message={errors.po_start_at?.message} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <LabelInput required>Closes</LabelInput>
                                            <Input type="datetime-local" {...register('po_end_at')} className="rounded-none" />
                                            <FieldError message={errors.po_end_at?.message} />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <LabelInput required>Production time (days)</LabelInput>
                                    <Controller
                                        control={form.control}
                                        name="po_estimate_days"
                                        render={({ field }) => (
                                            <NumberInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} suffix="days" />
                                        )}
                                    />
                                    <FieldError message={errors.po_estimate_days?.message} />
                                </div>
                            </>
                        ) : sizes.length > 0 ? (
                            <p className="text-xs text-muted-foreground">
                                Stock is managed per size in <b>Sizes &amp; Stock</b>.
                            </p>
                        ) : (
                            <div className="space-y-1.5">
                                <LabelInput required>Stock</LabelInput>
                                <Controller
                                        control={form.control}
                                        name="stock"
                                        render={({ field }) => (
                                            <NumberInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} suffix="pcs" />
                                        )}
                                    />
                                <FieldError message={errors.stock?.message} />
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <LabelInput required>Price (IDR)</LabelInput>
                            <Controller
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <NumberInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} prefix="IDR" />
                                        )}
                                    />
                            <p className="text-xs text-muted-foreground">Shown to buyers in Indonesia.</p>
                            <FieldError message={errors.price?.message} />
                        </div>
                        <div className="space-y-1.5">
                            <LabelInput required>Price (USD)</LabelInput>
                            <Controller
                                        control={form.control}
                                        name="price_usd"
                                        render={({ field }) => (
                                            <NumberInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} prefix="US$" decimals={2} />
                                        )}
                                    />
                            <p className="text-xs text-muted-foreground">Shown to buyers outside Indonesia.</p>
                            <FieldError message={errors.price_usd?.message} />
                        </div>
                        <div className="space-y-1.5">
                            <LabelInput required>Weight (grams)</LabelInput>
                            <Controller
                                        control={form.control}
                                        name="weight_gram"
                                        render={({ field }) => (
                                            <NumberInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} suffix="gram" />
                                        )}
                                    />
                            <p className="text-xs text-muted-foreground">Used to calculate shipping cost.</p>
                            <FieldError message={errors.weight_gram?.message} />
                        </div>
                    </section>
                </div>
            </div>
        </form>
    );
}
