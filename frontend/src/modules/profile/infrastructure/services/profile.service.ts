import { api } from '../../../../core/api/axios.instance';
import type { AuthUser } from '../../../auth/domain/interfaces/auth.interfaces';
import type { ChangePasswordFormValues, UpdateProfileFormValues } from '../../domain/schemas/profile.schemas';

interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

export const changePassword = async (data: ChangePasswordFormValues): Promise<void> => {
    await api.patch('/users/me/password', data);
};

export const updateProfile = async (data: UpdateProfileFormValues): Promise<AuthUser> => {
    const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl ? data.avatarUrl : null,
    };
    const response = await api.put<ApiResponse<AuthUser>>('/users/me', payload);
    return response.data.data;
};
