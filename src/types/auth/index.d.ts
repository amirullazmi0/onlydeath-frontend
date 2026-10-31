export interface LoginRequest {
    email: string;
    password: string;
}

export interface ForgetPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
}

export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN';
    is_active: boolean;
    created_at: string;
}

export interface AuthResponse {
    user: User;
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export interface GlobalAuthResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
