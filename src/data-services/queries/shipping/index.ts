import { QueriesDataService } from '../../type';

export type ShippingQueryKeys = 'shipping-areas' | 'shipping-zones' | 'shipping-origin';

export const shippingQueries: QueriesDataService<ShippingQueryKeys> = {
    'shipping-areas': '/shipping/areas',
    'shipping-zones': '/shipping/zones',
    'shipping-origin': '/shipping/origin',
};
