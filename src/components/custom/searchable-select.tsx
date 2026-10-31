'use client';
import { useId, useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Loader2, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface SearchableOption {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: SearchableOption[];
    value?: string;
    onChange: (value: string, option: SearchableOption) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    loading?: boolean;
    id?: string;
    className?: string;
}

const MAX_RENDERED = 200;

/** Dropdown with a filter box; handles long lists (countries, villages) by capping rendered rows. */
export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    searchPlaceholder = 'Search...',
    emptyText = 'No results',
    disabled,
    loading,
    id,
    className,
}: Readonly<SearchableSelectProps>) {
    const [open, setOpen] = useState(false);
    const listId = useId();
    const [query, setQuery] = useState('');
    const selected = options.find((o) => o.value === value);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const list = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
        return list.slice(0, MAX_RENDERED);
    }, [options, query]);

    return (
        <Popover
            open={open}
            onOpenChange={(o) => {
                setOpen(o);
                if (!o) setQuery('');
            }}
        >
            <PopoverTrigger asChild>
                <button
                    id={id}
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={listId}
                    disabled={disabled || loading}
                    className={cn(
                        'flex h-9 w-full items-center justify-between gap-2 border border-input bg-transparent px-3 text-sm text-left outline-none',
                        'focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50',
                        className,
                    )}
                >
                    <span className={cn('truncate', !selected && 'text-muted-foreground')}>
                        {loading ? 'Loading...' : (selected?.label ?? placeholder)}
                    </span>
                    {loading ? (
                        <Loader2 className="size-4 shrink-0 animate-spin opacity-50" />
                    ) : (
                        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-0 rounded-none w-[var(--radix-popover-trigger-width)] min-w-56">
                <div className="flex items-center gap-2 border-b border-black/10 px-3">
                    <Search className="size-4 shrink-0 opacity-50" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>
                <div id={listId} role="listbox" className="max-h-64 overflow-y-auto py-1">
                    {filtered.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">{emptyText}</p>}
                    {filtered.map((o) => (
                        <button
                            key={o.value}
                            type="button"
                            role="option"
                            aria-selected={o.value === value}
                            onClick={() => {
                                onChange(o.value, o);
                                setOpen(false);
                                setQuery('');
                            }}
                            className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-neutral-100"
                        >
                            <span className="truncate">{o.label}</span>
                            {o.value === value && <Check className="size-4 shrink-0" />}
                        </button>
                    ))}
                    {filtered.length === MAX_RENDERED && (
                        <p className="px-3 py-1.5 text-xs text-muted-foreground">Keep typing to narrow the list…</p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
