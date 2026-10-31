import ShopNavbar from '@/components/shop/shop.navbar';
import ShopFooter from '@/components/shop/shop.footer';

export default function ShopLayout({ children }: LayoutProps<'/'>) {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <ShopNavbar />
            <main className="flex-1">{children}</main>
            <ShopFooter />
        </div>
    );
}
