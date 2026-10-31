import { MutationDataService } from '../../type';

export type UsersMutationKeys =
    | 'create-user'
    | 'update-user'
    | 'reset-password-user'
    | 'delete-user';

export const usersMutations: MutationDataService<UsersMutationKeys> = {
    'create-user': {
        url: '/users',
        method: 'POST',
        refetchQueries: ['users'],
    },
    'update-user': {
        url: '/users/:id',
        method: 'PATCH',
        refetchQueries: ['users'],
    },
    'reset-password-user': {
        url: '/users/:id/reset-password',
        method: 'POST',
    },
    'delete-user': {
        url: '/users/:id',
        method: 'DELETE',
        refetchQueries: ['users'],
    },
};
