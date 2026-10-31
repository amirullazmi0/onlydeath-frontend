import Link from 'next/link';
import BrandLogo from '@/components/custom/brand-logo';

export default function AuthShell({
    title,
    subtitle,
    children,
}: Readonly<{ title: string; subtitle?: string; children: React.ReactNode }>) {
    return (
        <div className="min-h-screen grid md:grid-cols-2">
            <div className="hidden md:flex bg-black text-white flex-col justify-between p-12">
                <Link href="/">
                    <BrandLogo variant="wordmark" loading="eager" sizes="384px" className="w-96 max-w-full h-auto" />
                </Link>
                <p className="text-6xl font-black uppercase leading-[0.95]">
                    Admin
                    <br />
                    Panel
                </p>
                <p className="text-xs text-neutral-500">Authorized personnel only.</p>
            </div>
            <div className="flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <Link href="/" className="md:hidden block">
                        <BrandLogo variant="black" loading="eager" className="h-8 w-auto" />
                    </Link>
                    <h1 className="mt-8 md:mt-0 text-2xl font-black uppercase tracking-tight">{title}</h1>
                    {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
                    <div className="mt-8">{children}</div>
                </div>
            </div>
        </div>
    );
}
