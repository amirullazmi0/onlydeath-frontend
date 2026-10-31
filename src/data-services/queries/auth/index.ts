import { QueriesDataService } from '../../type';

export type AuthQueryKeys = 'me';

export const authQueries: QueriesDataService<AuthQueryKeys> = {
    me: '/auth/me',
};
