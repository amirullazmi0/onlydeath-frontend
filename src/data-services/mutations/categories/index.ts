import { MutationDataService } from '../../type';

export type CategoriesMutationKeys = 'create-category' | 'update-category' | 'delete-category';

export const categoriesMutations: MutationDataService<CategoriesMutationKeys> = {
    'create-category': {
        url: '/categories',
        method: 'POST',
        refetchQueries: ['categories'],
    },
    'update-category': {
        url: '/categories/:id',
        method: 'PATCH',
        refetchQueries: ['categories'],
    },
    'delete-category': {
        url: '/categories/:id',
        method: 'DELETE',
        refetchQueries: ['categories'],
    },
};
