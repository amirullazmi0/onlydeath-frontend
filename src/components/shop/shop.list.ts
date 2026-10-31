export const shopMenu = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/catalog' },
    { label: 'Track Order', href: '/track' },
];

export const footerColumns = [
    {
        title: 'Shop',
        links: [
            { label: 'All Products', href: '/catalog' },
            { label: 'Ready Stock', href: '/catalog?availability=READY' },
            { label: 'Pre-Order', href: '/catalog?availability=PRE_ORDER' },
        ],
    },
    {
        title: 'Help',
        links: [
            { label: 'Track Your Order', href: '/track' },
            { label: 'Cart', href: '/cart' },
            { label: 'How to Order', href: '/#how-to-order' },
        ],
    },
];
