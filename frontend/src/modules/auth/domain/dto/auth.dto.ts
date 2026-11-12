import type { AuthUser } from '../interfaces/auth.interfaces';
import type { LoginFormValues, RegisterFormValues } from '../schemas/auth.schemas';

export type LoginRequestDto = LoginFormValues;

export type RegisterRequestDto = Omit<RegisterFormValues, 'confirmPassword'>;

export interface GoogleLoginRequestDto {
    idToken: string;
}

export interface LoginResponseDto {
    accessToken: string;
    refreshToken?: string;
    user: AuthUser;
}

export interface RefreshTokenRequestDto {
    refreshToken: string;
}

export interface RefreshTokenResponseDto {
    accessToken: string;
    refreshToken?: string;
}
