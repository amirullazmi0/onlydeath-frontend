import { QueriesDataService } from '../../type';

export type CategoriesQueryKeys = 'categories';

export const categoriesQueries: QueriesDataService<CategoriesQueryKeys> = {
    categories: '/categories',
};
