'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import BrandLogo from '@/components/custom/brand-logo';
import { cn } from '@/lib/utils';
import { adminMenuItems } from './admin.list';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: Readonly<AdminSidebarProps>) {
    const pathname = usePathname();

    const isActive = (slug: string) =>
        slug === '/admin' ? pathname === slug : pathname === slug || pathname.startsWith(`${slug}/`);

    return (
        <>
            {isOpen && (
                <button
                    type="button"
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                    aria-label="Close menu"
                />
            )}

            <aside
                className={cn(
                    'fixed top-0 left-0 z-50 h-full w-64 bg-black text-white transform transition-transform duration-300 lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
                    <Link href="/admin" className="flex flex-col gap-1 leading-none">
                        <BrandLogo variant="white" loading="eager" className="h-6 w-auto" />
                        <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-400">
                            Admin Panel
                        </span>
                    </Link>
                    <button onClick={onClose} className="lg:hidden p-2" aria-label="Close">
                        <X className="size-5" />
                    </button>
                </div>

                <nav className="overflow-y-auto h-[calc(100vh-4rem)] p-4 space-y-6">
                    {adminMenuItems.map((group) => (
                        <div key={group.group}>
                            <p className="px-3 text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500">
                                {group.group}
                            </p>
                            <div className="mt-2 space-y-1">
                                {group.items.map((item) => (
                                    <Link
                                        key={item.slug}
                                        href={item.slug}
                                        onClick={onClose}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                                            isActive(item.slug)
                                                ? 'bg-white text-black font-semibold'
                                                : 'text-neutral-300 hover:bg-white/10 hover:text-white',
                                        )}
                                    >
                                        {item.icon}
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}
