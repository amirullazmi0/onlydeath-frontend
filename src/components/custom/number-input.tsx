'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface NumberInputProps {
    value: number | null | undefined;
    onChange: (value: number | undefined) => void;
    /** Allowed decimal places: 0 for IDR/stock, 2 for USD */
    decimals?: number;
    placeholder?: string;
    className?: string;
    /** Shown inside the field on the left, e.g. "IDR" or "$" */
    prefix?: string;
    suffix?: string;
    id?: string;
    disabled?: boolean;
    onBlur?: () => void;
}

const format = (value: number | null | undefined, decimals: number) =>
    value === null || value === undefined || Number.isNaN(value)
        ? ''
        : value.toLocaleString('en-US', { maximumFractionDigits: decimals });

/**
 * Numeric text field with thousand separators (1,250,000) while typing.
 * Emits a plain number (or undefined when empty) to the form.
 */
export default function NumberInput({
    value,
    onChange,
    decimals = 0,
    placeholder,
    className,
    prefix,
    suffix,
    id,
    disabled,
    onBlur,
}: Readonly<NumberInputProps>) {
    // Raw text while editing, so "12." or "1,0" don't get reformatted under the caret
    const [draft, setDraft] = useState<string | null>(null);

    const handleChange = (raw: string) => {
        let clean = raw.replace(decimals > 0 ? /[^\d.]/g : /\D/g, '');
        const dot = clean.indexOf('.');
        if (dot !== -1) clean = clean.slice(0, dot + 1) + clean.slice(dot + 1).replaceAll('.', '');

        const [intPart = '', fracPart] = clean.split('.');
        const frac = fracPart?.slice(0, decimals);
        const intText = intPart ? Number(intPart).toLocaleString('en-US') : frac !== undefined ? '0' : '';
        setDraft(intText + (frac !== undefined ? `.${frac}` : ''));

        onChange(clean === '' ? undefined : Number(`${intPart || '0'}${frac ? `.${frac}` : ''}`));
    };

    return (
        <div className={cn('relative flex items-center', className)}>
            {prefix && (
                <span className="pointer-events-none absolute left-3 text-xs font-semibold text-muted-foreground">
                    {prefix}
                </span>
            )}
            <Input
                id={id}
                type="text"
                inputMode={decimals > 0 ? 'decimal' : 'numeric'}
                value={draft ?? format(value, decimals)}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={() => {
                    setDraft(null);
                    onBlur?.();
                }}
                placeholder={placeholder}
                disabled={disabled}
                className={cn('rounded-none tabular-nums', prefix && 'pl-12', suffix && 'pr-12')}
            />
            {suffix && (
                <span className="pointer-events-none absolute right-3 text-xs font-semibold text-muted-foreground">
                    {suffix}
                </span>
            )}
        </div>
    );
}
