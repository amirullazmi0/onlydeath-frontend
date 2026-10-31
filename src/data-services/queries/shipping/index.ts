import { QueriesDataService } from '../../type';

export type ShippingQueryKeys = 'shipping-areas' | 'shipping-zones';

export const shippingQueries: QueriesDataService<ShippingQueryKeys> = {
    'shipping-areas': '/shipping/areas',
    'shipping-zones': '/shipping/zones',
};
