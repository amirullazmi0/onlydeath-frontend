import { AxiosError } from 'axios';

export interface PaginationMeta {
    total_data: number;
    total_page: number;
    current_page: number;
    limit: number;
}

export interface GlobalApiResponse<T = unknown> {
    message: string;
    success: boolean;
    data: T;
    meta?: PaginationMeta;
}

export type AxiosErrorResponse = AxiosError<ErrorResponse>;

export interface ErrorResponse {
    error: string | string[] | null;
    message: string;
}
