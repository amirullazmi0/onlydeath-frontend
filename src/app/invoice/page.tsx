import type { Metadata } from 'next';
import { Suspense } from 'react';
import InvoiceView from './invoice.view';

export const metadata: Metadata = { title: 'Invoice · ONLYDEATH' };

export default function Page() {
    return (
        <Suspense>
            <InvoiceView />
        </Suspense>
    );
}
