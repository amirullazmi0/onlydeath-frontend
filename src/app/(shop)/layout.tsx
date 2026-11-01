import ShopNavbar from '@/components/shop/shop.navbar';
import ShopFooter from '@/components/shop/shop.footer';

export default function ShopLayout({ children }: LayoutProps<'/'>) {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <ShopNavbar />
            <main className="flex-1">{children}</main>
            <ShopFooter />
            {/* Multiplied over everything so white surfaces, including product photos, read as paper */}
            <div
                aria-hidden
                className="fixed inset-0 z-[9999] pointer-events-none mix-blend-multiply"
                style={{ backgroundImage: 'url(/brand/paper.svg)' }}
            />
        </div>
    );
}
