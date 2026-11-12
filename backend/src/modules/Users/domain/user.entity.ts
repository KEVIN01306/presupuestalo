export interface User {
    id: string;
    email: string;
    passwordHash: string | null;
    googleId?: string | null;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    isActive: boolean;
    isVerify: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUser extends Omit<User, "id" | "isActive" | "isVerify" | "createdAt" | "updatedAt"> {
    isVerify?: boolean;
}

export interface UpdateUser extends Partial<Omit<User, "id" | "isActive" | "createdAt" | "updatedAt">> {}

export interface GetUser extends Omit<User, "passwordHash"> {
    emailSent?: boolean;
    generatedPassword?: string;
}

export interface GetSimpleUser extends Pick<User, "id" | "firstName" | "lastName" | "email" | "avatarUrl" | "isActive" | "isVerify"> {}
