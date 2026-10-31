'use client';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import NumberInput from '@/components/custom/number-input';
import type { SizeRow } from '../hooks/use-upsert.admin.products';

const PRESETS = [
    { label: 'S – XL', sizes: ['S', 'M', 'L', 'XL'] },
    { label: 'XS – XXL', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { label: 'Pants 28 – 36', sizes: ['28', '29', '30', '31', '32', '33', '34', '36'] },
    { label: 'One Size', sizes: ['ALL SIZE'] },
];

interface SizesEditorProps {
    sizes: SizeRow[];
    isPreOrder: boolean;
    onAdd: (label?: string) => void;
    onPreset: (labels: string[]) => void;
    onChange: (index: number, patch: Partial<SizeRow>) => void;
    onRemove: (index: number) => void;
}

export default function SizesEditor({ sizes, isPreOrder, onAdd, onPreset, onChange, onRemove }: Readonly<SizesEditorProps>) {
    const total = sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
    const current = sizes.map((s) => s.label.trim().toUpperCase()).join('|');

    return (
        <section className="bg-white border border-black/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest">Sizes & Stock</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {isPreOrder
                            ? 'Sizes buyers can choose. Pre-orders have no stock limit.'
                            : 'Each size has its own stock. Leave empty for products without sizes.'}{' '}
                        Picking a preset replaces the current sizes.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => {
                        const active = current === p.sizes.join('|');
                        return (
                            <button
                                key={p.label}
                                type="button"
                                onClick={() => onPreset(p.sizes)}
                                aria-pressed={active}
                                className={cn(
                                    'border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap',
                                    active ? 'bg-black text-white border-black' : 'border-black/20 hover:border-black',
                                )}
                            >
                                {p.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {sizes.length > 0 && (
                <table className="mt-4 w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                            <th className="pb-2 font-semibold">Size</th>
                            {!isPreOrder && <th className="pb-2 font-semibold">Stock</th>}
                            <th className="pb-2 w-10" />
                        </tr>
                    </thead>
                    <tbody>
                        {sizes.map((s, i) => (
                            <tr key={s.id ?? `new-${i}`}>
                                <td className="pr-3 py-1.5">
                                    <Input
                                        value={s.label}
                                        onChange={(e) => onChange(i, { label: e.target.value })}
                                        placeholder="e.g. M or 30"
                                        maxLength={20}
                                        className="rounded-none uppercase"
                                    />
                                </td>
                                {!isPreOrder && (
                                    <td className="pr-3 py-1.5">
                                        <NumberInput
                                            value={s.stock}
                                            onChange={(v) => onChange(i, { stock: v ?? 0 })}
                                            suffix="pcs"
                                            className="w-32"
                                        />
                                    </td>
                                )}
                                <td className="py-1.5 text-right">
                                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove size" onClick={() => onRemove(i)}>
                                        <Trash2 />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="mt-3 flex items-center justify-between">
                <Button type="button" variant="outline" size="sm" onClick={() => onAdd()} className="rounded-none text-xs uppercase">
                    <Plus /> Add Size
                </Button>
                {sizes.length > 0 && !isPreOrder && (
                    <p className="text-xs text-muted-foreground">
                        Total stock: <span className="font-semibold text-black">{total}</span>
                    </p>
                )}
            </div>
        </section>
    );
}
