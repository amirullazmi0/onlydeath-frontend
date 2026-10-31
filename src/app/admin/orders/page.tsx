import { Suspense } from 'react';
import AdminOrdersView from './admin.orders.view';

export default function Page() {
    return (
        <Suspense>
            <AdminOrdersView />
        </Suspense>
    );
}
