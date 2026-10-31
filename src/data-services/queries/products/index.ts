import { QueriesDataService } from '../../type';

export type ProductsQueryKeys = 'products' | 'product-by-slug' | 'products-admin' | 'product-by-id';

export const productsQueries: QueriesDataService<ProductsQueryKeys> = {
    products: '/products',
    'product-by-slug': '/products/slug/:slug',
    'products-admin': '/products/admin',
    'product-by-id': '/products/:id',
};
