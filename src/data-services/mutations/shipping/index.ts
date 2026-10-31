import { MutationDataService } from '../../type';

export type ShippingMutationKeys =
    | 'shipping-rates'
    | 'create-shipping-zone'
    | 'update-shipping-zone'
    | 'delete-shipping-zone'
    | 'update-shipping-origin';

export const shippingMutations: MutationDataService<ShippingMutationKeys> = {
    'shipping-rates': {
        url: '/shipping/rates',
        method: 'POST',
    },
    'create-shipping-zone': {
        url: '/shipping/zones',
        method: 'POST',
        refetchQueries: ['shipping-zones'],
    },
    'update-shipping-zone': {
        url: '/shipping/zones/:id',
        method: 'PATCH',
        refetchQueries: ['shipping-zones'],
    },
    'delete-shipping-zone': {
        url: '/shipping/zones/:id',
        method: 'DELETE',
        refetchQueries: ['shipping-zones'],
    },
    'update-shipping-origin': {
        url: '/shipping/origin',
        method: 'PATCH',
        refetchQueries: ['shipping-origin'],
    },
};
