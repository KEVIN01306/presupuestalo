import type { AuthUser, TeamRole } from '../../modules/auth/domain/interfaces/auth.interfaces';
import { useAuthStore } from '../store/authStore';

/**
 * Checks if the active team role satisfies the required permission/role check.
 * Maintained for backward compatibility with existing RouteProtector / UsersList.
 */
export const hasTeamRole = (allowedRoles: TeamRole[]): boolean => {
    const activeRole = useAuthStore.getState().activeRole;
    if (!activeRole) return false;
    return allowedRoles.includes(activeRole);
};

export const hasPermission = (
    userOrPermissions: AuthUser | string[] | null | undefined,
    requiredPermission: string
): boolean => {
    if (!requiredPermission) return true;
    if (!userOrPermissions) return false;

    if (Array.isArray(userOrPermissions)) {
        return userOrPermissions.includes(requiredPermission);
    }

    return Boolean(userOrPermissions.id);
};

export const hasSomePermission = (
    userOrPermissions: AuthUser | string[] | null | undefined,
    requiredPermissions: string[]
): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    if (!userOrPermissions) return false;

    if (Array.isArray(userOrPermissions)) {
        return requiredPermissions.some((p) => userOrPermissions.includes(p));
    }

    return Boolean(userOrPermissions.id);
};

export const hasEveryPermission = (
    userOrPermissions: AuthUser | string[] | null | undefined,
    requiredPermissions: string[]
): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    if (!userOrPermissions) return false;

    if (Array.isArray(userOrPermissions)) {
        return requiredPermissions.every((p) => userOrPermissions.includes(p));
    }

    return Boolean(userOrPermissions.id);
};
