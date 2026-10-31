import Image from 'next/image';

/** Web-sized files in public/brand, built from the originals in /assets. */
const LOGOS = {
    /** Horizontal lockup for light surfaces */
    black: { src: '/brand/logo-black.png', width: 1400, height: 232 },
    /** Horizontal lockup for dark surfaces */
    white: { src: '/brand/logo-white.png', width: 1400, height: 232 },
    /** Metal wordmark, dark surfaces only: its letters are cut out */
    wordmark: { src: '/brand/wordmark-white.png', width: 1400, height: 415 },
    /** Skull mark, dark surfaces only */
    skull: { src: '/brand/skull-white.png', width: 867, height: 1200 },
};

interface BrandLogoProps {
    variant: keyof typeof LOGOS;
    /** Sets the rendered size, e.g. "h-8 w-auto" */
    className?: string;
    alt?: string;
    sizes?: string;
    loading?: 'eager' | 'lazy';
}

export default function BrandLogo({
    variant,
    className,
    alt = 'ONLYDEATH Records',
    sizes = '320px',
    loading,
}: Readonly<BrandLogoProps>) {
    return <Image {...LOGOS[variant]} alt={alt} sizes={sizes} loading={loading} className={className} />;
}
