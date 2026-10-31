'use client';
import { useState } from 'react';
import AdminSidebar from '@/components/admin/admin.sidebar';
import AdminNavbar from '@/components/admin/admin.navbar';

/**
 * Auth gating happens in src/proxy.ts; this layout only renders the admin chrome.
 */
export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-neutral-50">
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="lg:ml-64 min-h-screen flex flex-col">
                <AdminNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
