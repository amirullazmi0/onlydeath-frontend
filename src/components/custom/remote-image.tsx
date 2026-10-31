'use client';
import Image from 'next/image';
import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RemoteImageProps {
    src?: string | null;
    alt: string;
    /** Rendered width hint for the optimizer, e.g. "(min-width: 768px) 25vw, 50vw" */
    sizes?: string;
    className?: string;
    priority?: boolean;
    /** contain = show the whole image (letterboxed); cover = fill and crop */
    fit?: 'cover' | 'contain';
}

/**
 * Fills its (relatively positioned) parent. Goes through next/image so the
 * browser loads from our origin, with an icon fallback for missing/broken files.
 */
export default function RemoteImage({
    src,
    alt,
    sizes = '256px',
    className,
    priority,
    fit = 'cover',
}: Readonly<RemoteImageProps>) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400">
                <ImageOff className="size-1/4 max-w-8 max-h-8" />
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            onError={() => setFailed(true)}
            className={cn(fit === 'contain' ? 'object-contain' : 'object-cover', className)}
        />
    );
}
