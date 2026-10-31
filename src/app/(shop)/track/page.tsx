import { Suspense } from 'react';
import TrackView from './track.view';

export default function Page() {
    return (
        <Suspense>
            <TrackView />
        </Suspense>
    );
}
