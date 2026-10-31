'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const variants = {
    success: {
        icon: CheckCircle2,
        title: 'Payment Successful',
        desc: 'Thank you! Your invoice and order number have been emailed to you. We will confirm your order shortly.',
    },
    pending: {
        icon: Clock,
        title: 'Awaiting Payment',
        desc: 'Complete your payment within 10 minutes of ordering, or the order expires. We emailed you a payment link, or you can resume from the Track Order page.',
    },
    error: {
        icon: XCircle,
        title: 'Payment Failed',
        desc: 'Your payment could not be processed. Retry from the Track Order page or place a new order.',
    },
};

export default function OrderResultScreen({ variant }: Readonly<{ variant: keyof typeof variants }>) {
    const orderNo = useSearchParams().get('order_no');
    const { icon: Icon, title, desc } = variants[variant];

    return (
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
            <Icon className="mx-auto size-14" strokeWidth={1.25} />
            <h1 className="mt-6 text-2xl font-black uppercase tracking-tight">{title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{desc}</p>

            {orderNo && (
                <div className="mt-8 border border-black p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Order Number
                    </p>
                    <p className="mt-2 text-xl font-mono font-bold tracking-wider select-all">{orderNo}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Keep this number to track your order.</p>
                </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                    href={orderNo ? `/track?order_no=${orderNo}` : '/track'}
                    className="bg-black text-white text-xs font-bold tracking-widest uppercase px-6 py-3"
                >
                    Track Order
                </Link>
                <Link
                    href="/catalog"
                    className="border border-black text-xs font-bold tracking-widest uppercase px-6 py-3"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}
