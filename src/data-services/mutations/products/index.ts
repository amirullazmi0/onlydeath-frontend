import { MutationDataService } from '../../type';

export type ProductsMutationKeys = 'create-product' | 'update-product' | 'delete-product';

export const productsMutations: MutationDataService<ProductsMutationKeys> = {
    'create-product': {
        url: '/products',
        method: 'POST',
        refetchQueries: ['products-admin'],
    },
    'update-product': {
        url: '/products/:id',
        method: 'PATCH',
        refetchQueries: ['products-admin', 'product-by-id'],
    },
    'delete-product': {
        url: '/products/:id',
        method: 'DELETE',
        refetchQueries: ['products-admin'],
    },
};
