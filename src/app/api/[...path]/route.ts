import { NextRequest, NextResponse } from 'next/server';
import { FRIENDLY_ERROR } from '@/lib/errors';

/**
 * BFF: the browser only ever talks to this Next server at /api/*, which forwards
 * to the Nest backend. The backend URL stays server-side, and any backend crash
 * or outage is replaced with a friendly message. 4xx responses pass through
 * because their messages are meant for the user (validation, out of stock, ...).
 */
const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:4000/api';
const TIMEOUT_MS = 30_000;
const FORWARDED_HEADERS = ['authorization', 'content-type', 'accept', 'accept-language'];

const friendly = (status: number) =>
    NextResponse.json({ success: false, message: FRIENDLY_ERROR, error: null }, { status });

async function proxy(request: NextRequest, { params }: RouteContext<'/api/[...path]'>) {
    const { path } = await params;
    const target = `${BACKEND_API_URL}/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;

    const headers = new Headers();
    for (const name of FORWARDED_HEADERS) {
        const value = request.headers.get(name);
        if (value) headers.set(name, value);
    }
    const clientIp = request.headers.get('x-forwarded-for');
    if (clientIp) headers.set('x-forwarded-for', clientIp);

    const hasBody = !['GET', 'HEAD'].includes(request.method);

    let res: Response;
    try {
        res = await fetch(target, {
            method: request.method,
            headers,
            // Raw bytes keep multipart uploads intact (boundary is in content-type)
            body: hasBody ? await request.arrayBuffer() : undefined,
            cache: 'no-store',
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
    } catch (err) {
        console.error(`[bff] ${request.method} ${target} failed:`, err);
        return friendly(503);
    }

    if (res.status >= 500) {
        console.error(`[bff] ${request.method} ${target} -> ${res.status}`, await res.text().catch(() => ''));
        return friendly(res.status);
    }

    return new NextResponse(res.body, {
        status: res.status,
        headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
    });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
