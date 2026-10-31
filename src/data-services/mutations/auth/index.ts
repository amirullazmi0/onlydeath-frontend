import { MutationDataService } from '../../type';

export type AuthKeys = 'login' | 'logout' | 'forgetPassword' | 'resetPassword' | 'changePassword';

export const authMutations: MutationDataService<AuthKeys> = {
    login: {
        url: '/auth/login',
        method: 'POST',
    },
    logout: {
        url: '/auth/logout',
        method: 'POST',
    },
    forgetPassword: {
        url: '/auth/forgot-password',
        method: 'POST',
    },
    resetPassword: {
        url: '/auth/reset-password',
        method: 'POST',
    },
    changePassword: {
        url: '/auth/change-password',
        method: 'PATCH',
    },
};
