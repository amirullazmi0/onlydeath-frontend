declare global {
    interface Window {
        snap?: {
            pay: (token: string, callbacks?: SnapCallbacks) => void;
        };
    }
}

export interface SnapCallbacks {
    onSuccess?: (result: unknown) => void;
    onPending?: (result: unknown) => void;
    onError?: (result: unknown) => void;
    onClose?: () => void;
}

const MIDTRANS_SANDBOX_URL = 'https://app.sandbox.midtrans.com/snap/snap.js';
const MIDTRANS_PRODUCTION_URL = 'https://app.midtrans.com/snap/snap.js';

let snapPromise: Promise<void> | null = null;

const getMidtransScriptUrl = () =>
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
        ? MIDTRANS_PRODUCTION_URL
        : MIDTRANS_SANDBOX_URL;

export const loadMidtransSnap = (clientKey: string) => {
    if (typeof window === 'undefined' || window.snap) return Promise.resolve();
    if (snapPromise) return snapPromise;

    snapPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = getMidtransScriptUrl();
        script.async = true;
        script.setAttribute('data-client-key', clientKey);
        script.onload = () => resolve();
        script.onerror = () => {
            snapPromise = null;
            reject(new Error('Failed to load Midtrans Snap'));
        };
        document.body.appendChild(script);
    });

    return snapPromise;
};

export const openMidtransSnap = async (
    token: string,
    clientKey: string,
    callbacks?: SnapCallbacks,
) => {
    await loadMidtransSnap(clientKey);
    if (!window.snap) throw new Error('Midtrans Snap is not available');
    window.snap.pay(token, callbacks);
};
