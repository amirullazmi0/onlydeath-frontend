import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Only admins have accounts, so a session cookie is enough to gate /admin.
 * The backend still verifies the JWT on every admin request.
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // A session lasts as long as it can still be refreshed by the axios interceptor
    const hasSession = Boolean(
        request.cookies.get('accessToken')?.value || request.cookies.get('refreshToken')?.value,
    );

    if (pathname.startsWith('/auth')) {
        return hasSession ? NextResponse.redirect(new URL('/admin', request.url)) : NextResponse.next();
    }

    if (pathname.startsWith('/admin') && !hasSession) {
        const loginUrl = new URL('/auth/sign-in', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/auth/:path*'],
};
