'use client';
import { useEffect } from 'react';
import { RotateCw } from 'lucide-react';
import { FRIENDLY_ERROR } from '@/lib/errors';

/** Catches render errors anywhere below the root layout and asks for a refresh. */
export default function Error({ error }: Readonly<{ error: Error & { digest?: string } }>) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="max-w-md text-center">
                <p className="text-2xl font-black uppercase tracking-tight">Oops.</p>
                <p className="mt-3 text-sm text-muted-foreground">{FRIENDLY_ERROR}</p>
                <button
                    onClick={() => globalThis.location.reload()}
                    className="mt-8 inline-flex items-center gap-2 bg-black text-white text-xs font-bold tracking-widest uppercase px-6 py-3"
                >
                    <RotateCw className="size-4" /> Refresh Page
                </button>
            </div>
        </div>
    );
}
