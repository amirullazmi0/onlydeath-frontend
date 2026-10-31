import { QueriesDataService } from '../../type';

export type UsersQueryKeys = 'users';

export const usersQueries: QueriesDataService<UsersQueryKeys> = {
    users: '/users',
};
