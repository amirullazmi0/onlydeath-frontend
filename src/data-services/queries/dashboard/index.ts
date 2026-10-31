import { QueriesDataService } from '../../type';

export type DashboardQueryKeys = 'dashboard' | 'finance';

export const dashboardQueries: QueriesDataService<DashboardQueryKeys> = {
    dashboard: '/dashboard',
    finance: '/finance',
};
