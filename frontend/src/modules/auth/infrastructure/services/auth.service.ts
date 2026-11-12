import axios from 'axios';
import { API_BASE_URL } from '../../../../core/api/config';
import type {
    LoginRequestDto,
    LoginResponseDto,
    RegisterRequestDto,
} from '../../domain/dto/auth.dto';
import type { AuthUser } from '../../domain/interfaces/auth.interfaces';

const AUTH_BASE_URL = `${API_BASE_URL}/auth`;

interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

export const loginUser = async (data: LoginRequestDto): Promise<LoginResponseDto> => {
    const response = await axios.post<ApiResponse<LoginResponseDto>>(
        `${AUTH_BASE_URL}/login`,
        data,
        { withCredentials: true }
    );
    return response.data.data;
};

export const registerUser = async (data: RegisterRequestDto): Promise<LoginResponseDto> => {
    const response = await axios.post<ApiResponse<LoginResponseDto>>(
        `${AUTH_BASE_URL}/register`,
        data,
        { withCredentials: true }
    );
    return response.data.data;
};

export const googleLoginUser = async (idToken: string): Promise<LoginResponseDto> => {
    const response = await axios.post<ApiResponse<LoginResponseDto>>(
        `${AUTH_BASE_URL}/google`,
        { idToken },
        { withCredentials: true }
    );
    return response.data.data;
};

export const refreshSession = async (): Promise<LoginResponseDto> => {
    const response = await axios.post<ApiResponse<LoginResponseDto>>(
        `${AUTH_BASE_URL}/refresh`,
        {},
        { withCredentials: true }
    );
    return response.data.data;
};

export const getCurrentUser = async (accessToken: string): Promise<AuthUser> => {
    const response = await axios.get<ApiResponse<AuthUser>>(`${AUTH_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
    });
    return response.data.data;
};

export const logoutUser = async (accessToken: string | null): Promise<void> => {
    if (!accessToken) return;
    await axios.post(
        `${AUTH_BASE_URL}/logout`,
        {},
        {
            headers: { Authorization: `Bearer ${accessToken}` },
            withCredentials: true,
        }
    );
};
