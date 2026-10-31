import { MutationDataService } from '../../type';

export type OrdersMutationKeys =
    | 'checkout'
    | 'cancel-order'
    | 'confirm-order'
    | 'ship-order'
    | 'deliver-order'
    | 'reject-order';

export const ordersMutations: MutationDataService<OrdersMutationKeys> = {
    checkout: {
        url: '/orders/checkout',
        method: 'POST',
    },
    'cancel-order': {
        url: '/orders/cancel',
        method: 'POST',
    },
    'confirm-order': {
        url: '/orders/:id/confirm',
        method: 'PATCH',
        refetchQueries: ['orders', 'order-by-id', 'dashboard'],
    },
    'ship-order': {
        url: '/orders/:id/ship',
        method: 'PATCH',
        refetchQueries: ['orders', 'order-by-id'],
    },
    'deliver-order': {
        url: '/orders/:id/deliver',
        method: 'PATCH',
        refetchQueries: ['orders', 'order-by-id', 'dashboard'],
    },
    'reject-order': {
        url: '/orders/:id/reject',
        method: 'PATCH',
        refetchQueries: ['orders', 'order-by-id', 'dashboard', 'finance'],
    },
};
