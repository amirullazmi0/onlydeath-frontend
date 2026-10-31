import { QueriesDataService } from '../../type';

export type OrdersQueryKeys = 'orders' | 'order-by-id' | 'order-track';

export const ordersQueries: QueriesDataService<OrdersQueryKeys> = {
    orders: '/orders',
    'order-by-id': '/orders/:id',
    'order-track': '/orders/track',
};
