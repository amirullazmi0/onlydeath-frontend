import { Suspense } from 'react';
import AuthResetPasswordView from './auth.reset-password.view';

export default function Page() {
    return (
        <Suspense>
            <AuthResetPasswordView />
        </Suspense>
    );
}
