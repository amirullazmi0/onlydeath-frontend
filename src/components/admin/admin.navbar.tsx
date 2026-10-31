'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Eye, LogOut, Menu, UserCog } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useAuth } from '@/hooks/react-query/useAuth';

interface AdminNavbarProps {
    onMenuClick: () => void;
}

export default function AdminNavbar({ onMenuClick }: Readonly<AdminNavbarProps>) {
    const user = useAuthStore((s) => s.user);
    // Also keeps the persisted user in sync with /auth/me
    const { logout } = useAuth();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handle = (e: MouseEvent) => {
            if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [open]);

    return (
        <header className="sticky top-0 z-30 bg-white border-b border-black/10">
            <div className="flex items-center justify-between h-16 px-4 md:px-6">
                <div className="flex items-center gap-3">
                    <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2" aria-label="Toggle menu">
                        <Menu className="size-5" />
                    </button>
                    <p className="hidden md:block text-sm text-muted-foreground">
                        Welcome back, <span className="font-semibold text-black">{user?.name ?? 'Admin'}</span>
                    </p>
                </div>

                <div ref={menuRef} className="flex items-center gap-2">
                    <Link
                        href="/"
                        target="_blank"
                        className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-100"
                    >
                        <Eye className="size-4" /> View Store
                    </Link>

                    <div className="relative">
                        <button
                            onClick={() => setOpen(!open)}
                            className="flex items-center gap-2 p-1.5 hover:bg-neutral-100"
                            aria-expanded={open}
                        >
                            <span className="size-8 bg-black text-white flex items-center justify-center text-sm font-bold">
                                {user?.name?.charAt(0).toUpperCase() ?? 'A'}
                            </span>
                            <ChevronDown className="size-4 hidden sm:block" />
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-2 w-60 bg-white border border-black shadow-lg z-40">
                                <div className="p-3 border-b border-black/10">
                                    <p className="font-semibold text-sm">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                </div>
                                <div className="p-1">
                                    <Link
                                        href="/admin/settings"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100"
                                    >
                                        <UserCog className="size-4" /> Settings
                                    </Link>
                                    <button
                                        onClick={() => logout()}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100"
                                    >
                                        <LogOut className="size-4" /> Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
