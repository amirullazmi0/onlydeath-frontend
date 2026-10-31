import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

/**
 * Renders product descriptions written in Markdown. Raw HTML is not rendered
 * (react-markdown default), so admin input can't inject markup.
 */
export default function Markdown({ children, className }: Readonly<{ children: string; className?: string }>) {
    return (
        <div className={cn('text-sm leading-relaxed text-neutral-700 space-y-3', className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: (props) => <h3 className="text-base font-bold text-black uppercase tracking-wide" {...props} />,
                    h2: (props) => <h4 className="text-sm font-bold text-black uppercase tracking-wide" {...props} />,
                    h3: (props) => <h5 className="text-sm font-semibold text-black" {...props} />,
                    p: (props) => <p className="whitespace-pre-line" {...props} />,
                    ul: (props) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                    ol: (props) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
                    strong: (props) => <strong className="font-semibold text-black" {...props} />,
                    a: (props) => <a className="underline" target="_blank" rel="noreferrer" {...props} />,
                    hr: () => <hr className="border-black/10" />,
                    table: (props) => <table className="w-full border-collapse text-left text-xs" {...props} />,
                    th: (props) => <th className="border border-black/15 bg-neutral-50 px-2 py-1.5 font-semibold" {...props} />,
                    td: (props) => <td className="border border-black/15 px-2 py-1.5" {...props} />,
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}
