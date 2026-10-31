import { QueriesDataService } from '../type';
import { authQueries, AuthQueryKeys } from './auth';
import { usersQueries, UsersQueryKeys } from './users';
import { categoriesQueries, CategoriesQueryKeys } from './categories';
import { productsQueries, ProductsQueryKeys } from './products';
import { shippingQueries, ShippingQueryKeys } from './shipping';
import { ordersQueries, OrdersQueryKeys } from './orders';
import { dashboardQueries, DashboardQueryKeys } from './dashboard';

export type AllQueryKeys =
    | AuthQueryKeys
    | UsersQueryKeys
    | CategoriesQueryKeys
    | ProductsQueryKeys
    | ShippingQueryKeys
    | OrdersQueryKeys
    | DashboardQueryKeys;

export const allQueries: QueriesDataService<AllQueryKeys> = {
    ...authQueries,
    ...usersQueries,
    ...categoriesQueries,
    ...productsQueries,
    ...shippingQueries,
    ...ordersQueries,
    ...dashboardQueries,
};
