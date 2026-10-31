import { Suspense } from 'react';
import OrderResultScreen from '../components/order-result-screen';

export default function Page() {
    return (
        <Suspense>
            <OrderResultScreen variant="pending" />
        </Suspense>
    );
}
