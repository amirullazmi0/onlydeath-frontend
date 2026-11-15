import BrandLogo from '@/components/custom/brand-logo';

export default function ShopFooter() {
    return (
        <footer className="bg-white py-8 flex flex-col items-center gap-3">
            <BrandLogo variant="black" className="h-6 w-auto" />
            <p className="text-xs text-muted-foreground uppercase">
                © {new Date().getFullYear()} ONLYDEATH. All rights reserved.
            </p>
        </footer>
    );
}
