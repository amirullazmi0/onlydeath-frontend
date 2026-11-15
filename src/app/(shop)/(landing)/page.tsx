import Link from 'next/link';
import BrandLogo from '@/components/custom/brand-logo';

const STRIP =
    'absolute bg-[#3b3833] text-[#d8d2c6] font-bold uppercase leading-none px-3 py-1.5 text-xl md:text-3xl';

/** Photocopy look: `skull-raw` roughens, speckles and tints the art; `dust` scatters sand around it. */
const RawFilters = () => (
    <svg aria-hidden className="absolute size-0">
        <filter id="skull-raw" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" result="rough" />
            <feColorMatrix
                in="noise"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  7 0 0 0 -2.6"
                result="speckle"
            />
            <feComposite in="rough" in2="speckle" operator="in" result="grainy" />
            <feFlood floodColor="#6f6a62" />
            <feComposite in2="grainy" operator="in" />
        </filter>
        <filter id="dust" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="noise" />
            <feColorMatrix
                in="noise"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  9 0 0 0 -5"
                result="grain"
            />
            <feComposite in="SourceGraphic" in2="grain" operator="in" />
        </filter>
    </svg>
);

export default function Page() {
    return (
        <section className="flex justify-center overflow-hidden px-4 py-8">
            <RawFilters />
            <Link href="/catalog" aria-label="Shop" className="relative isolate block">
                <span
                    aria-hidden
                    className="absolute -inset-x-[18%] -inset-y-[5%] -z-10 bg-[#a9a297] [filter:url(#dust)] [mask-image:radial-gradient(closest-side,black_35%,transparent)]"
                />
                <BrandLogo
                    variant="skull"
                    alt=""
                    loading="eager"
                    sizes="(min-width: 768px) 560px, 80vw"
                    className="h-[60vh] md:h-[78vh] w-auto select-none [filter:url(#skull-raw)]"
                />
                <span className={`${STRIP} left-[-6%] top-[14%] -rotate-3`}>Wear it.</span>
                <span className={`${STRIP} right-[-6%] bottom-[16%] rotate-2`}>Own it.</span>
            </Link>
        </section>
    );
}
