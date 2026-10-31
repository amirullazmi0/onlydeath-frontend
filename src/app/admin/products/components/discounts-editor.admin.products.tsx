'use client';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, LabelInput } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import NumberInput from '@/components/custom/number-input';
import type { DiscountRow } from '../hooks/use-upsert.admin.products';

interface DiscountsEditorProps {
    discounts: DiscountRow[];
    onAdd: () => void;
    onChange: (index: number, patch: Partial<DiscountRow>) => void;
    onRemove: (index: number) => void;
}

/** Percentage discounts; only the highest one active at checkout time applies. */
export default function DiscountsEditor({ discounts, onAdd, onChange, onRemove }: Readonly<DiscountsEditorProps>) {
    return (
        <section className="bg-white border border-black/10 p-5">
            <p className="text-xs font-bold uppercase tracking-widest">Discounts</p>
            <p className="mt-1 text-xs text-muted-foreground">
                Applies to IDR and USD prices. If several are active, the highest one is used. Leave dates empty
                to run without a time limit.
            </p>

            <div className="mt-4 space-y-3">
                {discounts.map((d, i) => (
                    <div key={d.id ?? `new-${i}`} className="border border-black/10 p-3 space-y-3">
                        <div className="grid grid-cols-[1fr_6rem_auto] gap-3 items-end">
                            <div className="space-y-1.5">
                                <LabelInput required>Name</LabelInput>
                                <Input
                                    value={d.name}
                                    onChange={(e) => onChange(i, { name: e.target.value })}
                                    placeholder="e.g. 11.11 Sale"
                                    className="rounded-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <LabelInput required>Off (%)</LabelInput>
                                <NumberInput
                                    value={d.discount_pct}
                                    onChange={(v) => onChange(i, { discount_pct: Math.min(100, v ?? 0) })}
                                    suffix="%"
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove discount" onClick={() => onRemove(i)}>
                                <Trash2 />
                            </Button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <LabelInput>Starts</LabelInput>
                                <Input
                                    type="datetime-local"
                                    value={d.start_at}
                                    onChange={(e) => onChange(i, { start_at: e.target.value })}
                                    className="rounded-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <LabelInput>Ends</LabelInput>
                                <Input
                                    type="datetime-local"
                                    value={d.end_at}
                                    onChange={(e) => onChange(i, { end_at: e.target.value })}
                                    className="rounded-none"
                                />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <Switch checked={d.is_active} onCheckedChange={(v) => onChange(i, { is_active: v })} />
                            Active
                        </label>
                    </div>
                ))}
            </div>

            <Button type="button" variant="outline" size="sm" onClick={onAdd} className="mt-3 rounded-none text-xs uppercase">
                <Plus /> Add Discount
            </Button>
        </section>
    );
}
