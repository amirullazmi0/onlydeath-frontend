'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/shop/product-card';
import RemoteImage from '@/components/custom/remote-image';
import useLanding from './landing.hook';
import { features, promos, steps } from './landing.list';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-center text-lg md:text-xl font-extrabold tracking-[0.15em] uppercase">
        {children}
    </h2>
);

const CtaLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
        href={href}
        className="inline-block bg-white text-black text-[11px] font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-neutral-200 transition-colors"
    >
        {children}
    </Link>
);

export default function LandingView() {
    const { trending, categories, isLoading } = useLanding();

    return (
        <div>
            {/* Hero */}
            <section className="relative bg-black text-white overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,#3a3a3a_0%,#000_60%)]" />
                <div className="relative mx-auto max-w-7xl px-4 md:px-8 py-24 md:py-36 grid md:grid-cols-2 items-center gap-10">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400">
                            New Arrivals
                        </p>
                        <h1 className="mt-4 text-5xl md:text-7xl font-black leading-[0.95] uppercase">
                            Wear it.
                            <br />
                            Own it.
                        </h1>
                        <p className="mt-6 max-w-sm text-sm text-neutral-300">
                            Black & white streetwear, no compromise. Ready stock ships fast,
                            pre-orders are made for you.
                        </p>
                        <div className="mt-8">
                            <CtaLink href="/catalog">Shop Now</CtaLink>
                        </div>
                    </div>
                    <p
                        aria-hidden
                        className="hidden md:block text-right text-[9rem] leading-none font-black text-white/5 select-none"
                    >
                        ONLY
                        <br />
                        DEATH
                    </p>
                </div>
            </section>

            {/* Features strip */}
            <section className="border-b border-black/10 bg-neutral-50">
                <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {features.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex items-center gap-3">
                            <Icon className="size-6 shrink-0" strokeWidth={1.5} />
                            <div>
                                <p className="text-[11px] font-bold tracking-wider uppercase">
                                    {title}
                                </p>
                                <p className="text-[11px] text-muted-foreground">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Shop by category */}
            {categories.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 md:px-8 pt-16">
                    <SectionTitle>Shop by Category</SectionTitle>
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
                        {categories.map((c) => (
                            <Link
                                key={c.id}
                                href={`/catalog?category=${c.slug}`}
                                className="group relative aspect-[3/4] bg-neutral-900 overflow-hidden"
                            >
                                {c.image && (
                                    <RemoteImage
                                        src={c.image}
                                        alt={c.name}
                                        sizes="(min-width: 768px) 20vw, 50vw"
                                        className="grayscale opacity-70 transition-transform duration-500 group-hover:scale-105"
                                    />
                                )}
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
                                    <span className="text-lg font-extrabold tracking-wider uppercase">
                                        {c.name}
                                    </span>
                                    <span className="border border-white/80 bg-black/60 text-[10px] font-bold tracking-widest uppercase px-3 py-1">
                                        Shop Now
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Trending */}
            <section className="mx-auto max-w-7xl px-4 md:px-8 py-16">
                <SectionTitle>Trending Now</SectionTitle>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {isLoading &&
                        Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-square rounded-none" />
                        ))}
                    {trending.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
                {!isLoading && trending.length === 0 && (
                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Products coming soon.
                    </p>
                )}
                <div className="mt-10 text-center">
                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase underline underline-offset-8"
                    >
                        View all <ArrowRight className="size-4" />
                    </Link>
                </div>
            </section>

            {/* Promo banners */}
            <section className="mx-auto max-w-7xl px-4 md:px-8 pb-16 grid md:grid-cols-3 gap-4">
                {promos.map((p, i) => (
                    <div
                        key={p.title}
                        className={`relative h-48 p-8 flex flex-col justify-center text-white ${
                            i === 1 ? 'bg-neutral-800' : 'bg-black'
                        }`}
                    >
                        <p className="text-xl font-extrabold tracking-wider uppercase">{p.title}</p>
                        <p className="mt-1 text-sm text-neutral-300">{p.subtitle}</p>
                        <div className="mt-5">
                            <CtaLink href={p.href}>{p.cta}</CtaLink>
                        </div>
                    </div>
                ))}
            </section>

            {/* How to order */}
            <section id="how-to-order" className="bg-black text-white">
                <div className="mx-auto max-w-7xl px-4 md:px-8 py-16">
                    <h2 className="text-lg md:text-xl font-extrabold tracking-[0.15em] uppercase">
                        How to Order
                    </h2>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                        {steps.map((s) => (
                            <div key={s.no} className="border-t border-white/20 pt-4">
                                <p className="text-3xl font-black text-white/30">{s.no}</p>
                                <p className="mt-2 font-bold uppercase tracking-wider">{s.title}</p>
                                <p className="mt-1 text-sm text-neutral-400">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
