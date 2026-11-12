import AppError from "@shared/errors/AppError.js";
import type { HashProvider } from "@shared/domain/hash.provider.js";
import type { AuthRepository } from "../domain/auth.repository.js";
import type { AuthTeamMembership } from "../domain/auth-user.entity.js";
import type JwtProvider from "../domain/jwt.provider.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";

interface LoginDTO {
    email: string;
    password: string;
}

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        firstName: string;
        lastName: string;
        email: string;
        avatarUrl: string | null;
        isVerify: boolean;
        teamMemberships: AuthTeamMembership[];
    };
}

export class LoginUseCase {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly jwtProvider: JwtProvider,
        private readonly hashProvider: HashProvider,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(data: LoginDTO, context?: AuditContext): Promise<LoginResponse> {
        const { email, password } = data;

        const user = await this.authRepository.findByEmail(email);

        if (!user) {
            throw new AppError("Invalid credentials", "INVALID_CREDENTIALS", 401);
        }

        if (!user.passwordHash) {
            throw new AppError(
                "Esta cuenta usa inicio de sesión con Google. Inicia sesión con Google.",
                "USER_NO_PASSWORD",
                403
            );
        }

        if (!user.isActive) {
            throw new AppError("User is inactive", "USER_INACTIVE", 403);
        }

        let isValid = false;
        try {
            isValid = await this.hashProvider.compare(password, user.passwordHash);
        } catch (error) {
            console.log("Error comparing password", error);
            throw new AppError("Error comparing password", "INVALID_CREDENTIALS", 401);
        }

        if (!isValid) {
            throw new AppError("Invalid credentials", "INVALID_CREDENTIALS", 401);
        }

        const { accessToken, refreshToken } = await this.jwtProvider.generateTokens(
            user.id,
            user.email
        );

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.authRepository.upsertSession(
            user.id,
            refreshToken,
            expiresAt
        );

        await this.auditLogService.record({
            userId: user.id,
            action: "LOGIN",
            resource: "auth",
            resourceId: user.id,
            context,
            details: {
                email: user.email,
                loginMethod: "password",
            },
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`.trim(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatarUrl: user.avatarUrl ?? null,
                isVerify: user.isVerify,
                teamMemberships: user.teamMemberships,
            },
        };
    }
}
