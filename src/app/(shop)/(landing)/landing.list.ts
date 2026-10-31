import { Clock, Globe, PackageCheck, ShieldCheck } from 'lucide-react';

export const features = [
    { icon: Globe, title: 'Worldwide Shipping', desc: 'We ship to your door, anywhere' },
    { icon: ShieldCheck, title: 'Secure Payment', desc: 'Cards, e-wallets & more via Midtrans' },
    { icon: PackageCheck, title: 'Ready & Pre-Order', desc: 'Ready ships fast, PO made for you' },
    { icon: Clock, title: 'Track Anytime', desc: 'Just use your order number' },
];

export const promos = [
    {
        title: 'Ready Stock',
        subtitle: 'Ships right away',
        cta: 'Shop Ready',
        href: '/catalog?availability=READY',
    },
    {
        title: 'Pre-Order',
        subtitle: 'Made just for you',
        cta: 'Shop PO',
        href: '/catalog?availability=PRE_ORDER',
    },
    {
        title: 'Track Order',
        subtitle: 'Where is my package?',
        cta: 'Track Now',
        href: '/track',
    },
];

export const steps = [
    { no: '01', title: 'Pick Your Items', desc: 'Add ready stock or pre-order items to your cart.' },
    { no: '02', title: 'Shipping Details', desc: 'Enter your address anywhere in the world and pick a shipping option.' },
    { no: '03', title: 'Pay', desc: 'Pay securely via Midtrans. Your invoice is emailed right away.' },
    { no: '04', title: 'Track', desc: 'Use your order number to follow your package.' },
];
