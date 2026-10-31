import Link from 'next/link';
import BrandLogo from '@/components/custom/brand-logo';
import { footerColumns } from './shop.list';

export default function ShopFooter() {
    return (
        <footer className="bg-white border-t border-black/10">
            <div className="mx-auto max-w-7xl px-4 md:px-8 py-12 grid gap-10 md:grid-cols-4">
                <div className="md:col-span-2">
                    <BrandLogo variant="black" className="h-10 w-auto" />
                    <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                        Streetwear, no compromise. Ready stock ships fast, pre-orders are made just
                        for you.
                    </p>
                </div>
                {footerColumns.map((col) => (
                    <div key={col.title}>
                        <p className="text-xs font-bold tracking-[0.2em] uppercase">{col.title}</p>
                        <ul className="mt-4 space-y-2">
                            {col.links.map((l) => (
                                <li key={l.href}>
                                    <Link
                                        href={l.href}
                                        className="text-sm text-muted-foreground hover:text-black"
                                    >
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="border-t border-black/10 py-4 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} ONLYDEATH. All rights reserved.
            </div>
        </footer>
    );
}
