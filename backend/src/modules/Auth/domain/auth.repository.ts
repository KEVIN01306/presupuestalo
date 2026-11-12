import type { AuthUser } from "./auth-user.entity.js";
import type { AuthSession } from "./auth-session.entity.js";

export interface CreatePersonalUserDTO {
    email: string;
    passwordHash?: string | null;
    googleId?: string | null;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    isVerify: boolean;
}

export interface AuthRepository {
    findByEmail(email: AuthUser["email"]): Promise<AuthUser | null>;
    findByGoogleId(googleId: string): Promise<AuthUser | null>;
    findById(id: AuthUser["id"]): Promise<AuthUser | null>;
    createWithPersonalSpace(data: CreatePersonalUserDTO): Promise<AuthUser>;
    linkGoogleAccount(userId: string, googleId: string, avatarUrl?: string | null): Promise<AuthUser>;
    findSessionByToken(token: AuthSession["token"]): Promise<AuthSession | null>;
    findSessionByUserId(userId: AuthUser["id"]): Promise<AuthSession | null>;
    upsertSession(userId: AuthUser["id"], token: AuthSession["token"], expiresAt: Date): Promise<void>;
    deleteSession(userId: AuthUser["id"]): Promise<void>;
}
