import type { Metadata } from 'next';
import { Courier_Prime } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import './globals.css';
import QueryProvider from '@/provider/QueryProvider';
import { Toaster } from '@/components/ui/sonner';

// Typewriter monospace for the whole site (Foulplay-style); bold covers the heavy headings
const typewriter = Courier_Prime({
    weight: ['400', '700'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
    variable: '--font-typewriter',
});

export const metadata: Metadata = {
    title: 'ONLYDEATH',
    description: 'Streetwear. Ready stock & pre-order.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html lang="id" suppressHydrationWarning>
            <body className={`${typewriter.variable} font-sans antialiased`}>
                <NuqsAdapter>
                    <QueryProvider>
                        <Toaster position="top-center" />
                        {children}
                    </QueryProvider>
                </NuqsAdapter>
            </body>
        </html>
    );
}
