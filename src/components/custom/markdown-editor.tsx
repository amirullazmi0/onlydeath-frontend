'use client';
import { useRef, useState } from 'react';
import { Bold, Heading, Italic, List, ListOrdered } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import Markdown from './markdown';

interface Tool {
    icon: typeof Bold;
    label: string;
    /** Marker wrapped around the selection */
    wrap?: string;
    /** Prefix added to each selected line; 'numbered' counts 1., 2., ... */
    prefix?: string;
}

const TOOLS: Tool[] = [
    { icon: Bold, label: 'Bold', wrap: '**' },
    { icon: Italic, label: 'Italic', wrap: '_' },
    { icon: Heading, label: 'Heading', prefix: '### ' },
    { icon: List, label: 'Bullet list', prefix: '- ' },
    { icon: ListOrdered, label: 'Numbered list', prefix: 'numbered' },
];

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

/** Plain textarea with Markdown shortcuts and a live preview tab. */
export default function MarkdownEditor({ value, onChange, placeholder }: Readonly<MarkdownEditorProps>) {
    const ref = useRef<HTMLTextAreaElement>(null);
    const [tab, setTab] = useState<'write' | 'preview'>('write');

    /** Wraps the selection (bold/italic) and restores the cursor inside the markers. */
    const wrap = (marker: string) => {
        const el = ref.current;
        if (!el) return;
        const { selectionStart: s, selectionEnd: e } = el;
        const selected = value.slice(s, e) || 'text';
        onChange(value.slice(0, s) + marker + selected + marker + value.slice(e));
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(s + marker.length, s + marker.length + selected.length);
        });
    };

    /** Prefixes every selected line (lists, heading); numbered lists count up. */
    const prefixLines = (prefix: (i: number) => string) => {
        const el = ref.current;
        if (!el) return;
        const lineStart = value.lastIndexOf('\n', el.selectionStart - 1) + 1;
        const lineEnd = value.indexOf('\n', el.selectionEnd);
        const end = lineEnd === -1 ? value.length : lineEnd;
        const block = value
            .slice(lineStart, end)
            .split('\n')
            .map((line, i) => prefix(i) + line)
            .join('\n');
        onChange(value.slice(0, lineStart) + block + value.slice(end));
        requestAnimationFrame(() => el.focus());
    };

    const apply = (tool: Tool) => {
        if (tool.wrap) wrap(tool.wrap);
        else if (tool.prefix === 'numbered') prefixLines((i) => `${i + 1}. `);
        else if (tool.prefix) prefixLines(() => tool.prefix as string);
    };

    return (
        <div className="border border-input">
            <div className="flex items-center justify-between border-b border-input bg-neutral-50">
                <div className="flex">
                    {(['write', 'preview'] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={cn(
                                'px-3 py-2 text-xs font-bold uppercase tracking-wider',
                                tab === t ? 'bg-white text-black' : 'text-muted-foreground',
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                {tab === 'write' && (
                    <div className="flex gap-1 px-1">
                        {TOOLS.map((tool) => (
                            <button
                                key={tool.label}
                                type="button"
                                onClick={() => apply(tool)}
                                title={tool.label}
                                aria-label={tool.label}
                                className="p-1.5 hover:bg-neutral-200"
                            >
                                <tool.icon className="size-4" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {tab === 'write' ? (
                <Textarea
                    ref={ref}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={10}
                    className="rounded-none border-0 shadow-none focus-visible:ring-0 min-h-48 font-mono text-[13px]"
                />
            ) : (
                <div className="min-h-48 p-3">
                    {value.trim() ? (
                        <Markdown>{value}</Markdown>
                    ) : (
                        <p className="text-sm text-muted-foreground">Nothing to preview.</p>
                    )}
                </div>
            )}
            <p className="border-t border-input px-3 py-1.5 text-[11px] text-muted-foreground">
                Markdown supported: **bold**, _italic_, - bullet list, 1. numbered list, blank line for a new paragraph.
            </p>
        </div>
    );
}
