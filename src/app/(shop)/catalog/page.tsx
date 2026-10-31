import { Suspense } from 'react';
import CatalogView from './catalog.view';

export default function Page() {
    return (
        <Suspense>
            <CatalogView />
        </Suspense>
    );
}
