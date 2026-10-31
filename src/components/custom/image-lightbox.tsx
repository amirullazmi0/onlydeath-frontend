'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
    images: string[];
    /** Open image index, or null when closed */
    index: number | null;
    onIndexChange: (index: number | null) => void;
    title?: string;
}

/** Full-screen image preview carousel with arrows, keyboard and thumbnails. */
export default function ImageLightbox({ images, index, onIndexChange, title = 'Image preview' }: Readonly<ImageLightboxProps>) {
    const open = index !== null && images.length > 0;
    const current = index ?? 0;
    const go = (delta: number) => onIndexChange((current + delta + images.length) % images.length);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') onIndexChange((current + 1) % images.length);
            if (e.key === 'ArrowLeft') onIndexChange((current - 1 + images.length) % images.length);
        };
        globalThis.addEventListener('keydown', onKey);
        return () => globalThis.removeEventListener('keydown', onKey);
    }, [open, current, images.length, onIndexChange]);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onIndexChange(null)}>
            <DialogContent
                showCloseButton={false}
                className="max-w-[min(95vw,75vh)] sm:max-w-[min(95vw,75vh)] w-full p-0 gap-0 rounded-none border-0 bg-black text-white"
            >
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <div className="flex items-center justify-between px-4 py-3 text-xs tracking-widest">
                    <span>
                        {current + 1} / {images.length}
                    </span>
                    <button onClick={() => onIndexChange(null)} aria-label="Close preview" className="p-1 hover:opacity-70">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Square stage sized to fit the viewport; the whole image is shown (contain) */}
                <div className="relative mx-auto aspect-square w-full max-w-[min(95vw,75vh)]">
                    {open && (
                        <Image
                            key={images[current]}
                            src={images[current]}
                            alt={`${title} ${current + 1}`}
                            fill
                            sizes="95vw"
                            className="object-contain"
                            priority
                        />
                    )}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={() => go(-1)}
                                aria-label="Previous image"
                                className="absolute left-2 top-1/2 -translate-y-1/2 size-10 bg-white/10 hover:bg-white/25 flex items-center justify-center"
                            >
                                <ChevronLeft className="size-6" />
                            </button>
                            <button
                                onClick={() => go(1)}
                                aria-label="Next image"
                                className="absolute right-2 top-1/2 -translate-y-1/2 size-10 bg-white/10 hover:bg-white/25 flex items-center justify-center"
                            >
                                <ChevronRight className="size-6" />
                            </button>
                        </>
                    )}
                </div>

                {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto p-3 justify-center">
                        {images.map((src, i) => (
                            <button
                                key={src}
                                onClick={() => onIndexChange(i)}
                                aria-label={`Show image ${i + 1}`}
                                className={cn(
                                    'relative size-14 shrink-0 border-2',
                                    i === current ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100',
                                )}
                            >
                                <Image src={src} alt="" fill sizes="56px" className="object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
