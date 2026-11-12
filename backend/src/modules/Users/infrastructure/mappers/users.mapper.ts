import type { User, GetUser, GetSimpleUser } from "../../domain/user.entity.js";

export class UsersMapper {
    static toDomain(user: any): User {
        return {
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash ?? null,
            googleId: user.googleId ?? null,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl ?? null,
            isActive: Boolean(user.isActive),
            isVerify: Boolean(user.isVerify),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    static toGetUser(user: any): GetUser {
        return {
            id: user.id,
            email: user.email,
            googleId: user.googleId ?? null,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl ?? null,
            isActive: Boolean(user.isActive),
            isVerify: Boolean(user.isVerify),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    static toGetSimpleUser(user: any): GetSimpleUser {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl ?? null,
            isActive: Boolean(user.isActive),
            isVerify: Boolean(user.isVerify),
        };
    }
}
