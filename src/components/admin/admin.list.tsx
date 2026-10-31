import {
    Globe,
    Home,
    Package,
    Settings,
    ShoppingBag,
    Tags,
    Users,
    Wallet,
} from 'lucide-react';

export interface AdminMenuInterface {
    name: string;
    slug: string;
    icon: React.ReactNode;
}

export const adminMenuItems: { group: string; items: AdminMenuInterface[] }[] = [
    {
        group: 'Overview',
        items: [{ name: 'Dashboard', slug: '/admin', icon: <Home className="size-4" /> }],
    },
    {
        group: 'Catalog',
        items: [
            { name: 'Products', slug: '/admin/products', icon: <Package className="size-4" /> },
            { name: 'Categories', slug: '/admin/categories', icon: <Tags className="size-4" /> },
        ],
    },
    {
        group: 'Sales',
        items: [
            { name: 'Orders', slug: '/admin/orders', icon: <ShoppingBag className="size-4" /> },
            { name: 'Shipping Zones', slug: '/admin/shipping-zones', icon: <Globe className="size-4" /> },
            { name: 'Finance & Payout', slug: '/admin/finance', icon: <Wallet className="size-4" /> },
        ],
    },
    {
        group: 'System',
        items: [
            { name: 'Admin Users', slug: '/admin/users', icon: <Users className="size-4" /> },
            { name: 'Settings', slug: '/admin/settings', icon: <Settings className="size-4" /> },
        ],
    },
];
