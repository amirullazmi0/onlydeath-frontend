import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import useMutationApiRequest from '@/hooks/react-query/useMutationApiRequest';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { Category, Product, UploadResponse, UpsertProductRequest } from '@/types/product';
import { productSchema, ProductFormData } from '../config/config.admin.products';

export interface SizeRow {
    /** Existing size id; kept so past orders still reference the same size */
    id?: string;
    label: string;
    stock: number;
}

export interface DiscountRow {
    id?: string;
    name: string;
    discount_pct: number;
    /** datetime-local values; empty = open-ended */
    start_at: string;
    end_at: string;
    is_active: boolean;
}

/** ISO timestamp -> value for <input type="datetime-local"> */
const toLocalInput = (iso: string | null) => (iso ? dayjs(iso).format('YYYY-MM-DDTHH:mm') : '');

export default function useUpsertAdminProduct(id?: string) {
    const router = useRouter();
    const isEdit = !!id;
    const [images, setImages] = useState<UploadResponse[]>([]);
    // Optional sizes, each with its own stock (S/M/L/XL, or 28/30/32 for pants)
    const [sizes, setSizes] = useState<SizeRow[]>([]);
    // Percentage discounts; the highest active one applies (kratify rule)
    const [discounts, setDiscounts] = useState<DiscountRow[]>([]);

    const form = useForm<ProductFormData>({
        resolver: yupResolver(productSchema),
        defaultValues: {
            name: '',
            description: '',
            category_id: '',
            price: 0,
            price_usd: 0,
            weight_gram: 300,
            availability: 'READY',
            stock: 0,
            po_estimate_days: undefined,
            po_mode: 'ANYTIME',
            po_start_at: '',
            po_end_at: '',
            is_active: true,
        },
    });

    const { data: categories } = useQueryApiRequest<GlobalApiResponse<Category[]>>({ key: 'categories' });
    const { data: detail, isLoading: detailLoading } = useQueryApiRequest<GlobalApiResponse<Product>>({
        key: 'product-by-id',
        params: { id: id ?? '' },
        options: { enabled: isEdit },
    });

    // Populate the form once the product arrives
    useEffect(() => {
        const p = detail?.data;
        if (!p) return;
        form.reset({
            name: p.name,
            description: p.description,
            category_id: p.categoryId ?? '',
            price: p.price,
            price_usd: p.priceUsdCents / 100,
            weight_gram: p.weightGram,
            availability: p.availability,
            stock: p.stock,
            po_estimate_days: p.poEstimateDays ?? undefined,
            po_mode: p.poMode ?? 'ANYTIME',
            po_start_at: toLocalInput(p.poStartAt),
            po_end_at: toLocalInput(p.poEndAt),
            is_active: p.isActive,
        });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setImages(p.images.map((img) => ({ url: img.url, file_id: img.fileId ?? undefined })));
        setSizes(p.sizes.map((s) => ({ id: s.id, label: s.label, stock: s.stock })));
        setDiscounts(
            p.discounts.map((d) => ({
                id: d.id,
                name: d.name,
                discount_pct: d.discountPct,
                start_at: toLocalInput(d.startAt),
                end_at: toLocalInput(d.endAt),
                is_active: d.isActive,
            })),
        );
    }, [detail, form]);

    const uploadMutation = useMutationApiRequest<GlobalApiResponse<UploadResponse>, FormData>({
        key: 'upload-image',
        config: { showLoading: false, successNotification: false, errorNotification: true },
    });

    const uploadFiles = async (files: FileList | null) => {
        if (!files) return;
        for (const file of Array.from(files)) {
            const body = new FormData();
            body.append('file', file);
            const res = await uploadMutation.mutateAsync(body).catch(() => null);
            if (res?.data) setImages((prev) => [...prev, res.data]);
        }
    };

    const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));
    const makeCover = (index: number) =>
        setImages((prev) => [prev[index], ...prev.filter((_, i) => i !== index)]);

    const saveMutation = useMutationApiRequest<GlobalApiResponse<Product>, UpsertProductRequest>({
        key: isEdit ? 'update-product' : 'create-product',
        params: () => ({ id: id ?? '' }),
        // Edits return to the product's detail page; new products go back to the list
        options: { onSuccess: () => router.push(isEdit ? `/admin/products/${id}` : '/admin/products') },
    });

    const onSubmit = form.handleSubmit(({ price_usd, po_mode, po_start_at, po_end_at, ...data }) => {
        const cleanSizes = sizes
            .map((s) => ({ ...s, label: s.label.trim().toUpperCase() }))
            .filter((s) => s.label);
        const labels = cleanSizes.map((s) => s.label);
        if (new Set(labels).size !== labels.length) {
            toast.error('Size labels must be unique');
            return;
        }
        const badDiscount = discounts.find(
            (d) =>
                d.name.trim().length < 2 ||
                !(d.discount_pct >= 1 && d.discount_pct <= 100) ||
                (d.start_at && d.end_at && new Date(d.end_at) <= new Date(d.start_at)),
        );
        if (badDiscount) {
            toast.error('Each discount needs a name, 1-100%, and an end after its start');
            return;
        }
        const isPO = data.availability === 'PRE_ORDER';
        const isPeriod = isPO && po_mode === 'PERIOD';
        saveMutation.mutate({
            ...data,
            price_usd_cents: Math.round(price_usd * 100),
            category_id: data.category_id || null,
            po_estimate_days: isPO ? data.po_estimate_days : undefined,
            po_mode: isPO ? po_mode : undefined,
            po_start_at: isPeriod && po_start_at ? new Date(po_start_at).toISOString() : undefined,
            po_end_at: isPeriod && po_end_at ? new Date(po_end_at).toISOString() : undefined,
            images,
            sizes: cleanSizes,
            discounts: discounts.map((d) => ({
                id: d.id,
                name: d.name.trim(),
                discount_pct: d.discount_pct,
                start_at: d.start_at ? new Date(d.start_at).toISOString() : undefined,
                end_at: d.end_at ? new Date(d.end_at).toISOString() : undefined,
                is_active: d.is_active,
            })),
        });
    });

    const addSize = (label = '') => setSizes((prev) => [...prev, { label, stock: 0 }]);
    /**
     * Replaces the size set with a preset. Sizes that exist in both keep their
     * id and stock, so switching presets back and forth doesn't lose stock.
     */
    const applyPreset = (labels: string[]) =>
        setSizes((prev) =>
            labels.map(
                (label) => prev.find((s) => s.label.trim().toUpperCase() === label) ?? { label, stock: 0 },
            ),
        );
    const updateSize = (index: number, patch: Partial<SizeRow>) =>
        setSizes((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    const removeSize = (index: number) => setSizes((prev) => prev.filter((_, i) => i !== index));

    const addDiscount = () =>
        setDiscounts((prev) => [...prev, { name: '', discount_pct: 10, start_at: '', end_at: '', is_active: true }]);
    const updateDiscount = (index: number, patch: Partial<DiscountRow>) =>
        setDiscounts((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
    const removeDiscount = (index: number) => setDiscounts((prev) => prev.filter((_, i) => i !== index));

    return {
        form,
        isEdit,
        detailLoading: isEdit && detailLoading,
        categories: categories?.data ?? [],
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
        uploading: uploadMutation.isPending,
        removeImage,
        makeCover,
        onSubmit,
        saving: saveMutation.isPending,
    };
}
