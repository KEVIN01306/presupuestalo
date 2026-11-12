import AppError from "@shared/errors/AppError.js";
import { UniqueConstraintError } from "@shared/db/database/errors/UniqueConstraintError.js";
import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import type { HashProvider } from "@shared/domain/hash.provider.js";
import type { AuthRepository } from "../domain/auth.repository.js";
import type { AuthTeamMembership } from "../domain/auth-user.entity.js";
import type JwtProvider from "../domain/jwt.provider.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";

export interface RegisterDTO {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface RegisterResponse {
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

export class RegisterUseCase {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly jwtProvider: JwtProvider,
        private readonly hashProvider: HashProvider,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(data: RegisterDTO, context?: AuditContext): Promise<RegisterResponse> {
        try {
            const normalizedEmail = data.email.toLowerCase().trim();
            const existing = await this.authRepository.findByEmail(normalizedEmail);
            if (existing) {
                throw new AppError("El correo electrónico ya está registrado", "DATA_ALREADY_EXISTS", 409);
            }

            const passwordHash = await this.hashProvider.hash(data.password);

            const user = await this.authRepository.createWithPersonalSpace({
                email: normalizedEmail,
                passwordHash,
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                isVerify: false,
            });

            const { accessToken, refreshToken } = await this.jwtProvider.generateTokens(
                user.id,
                user.email
            );

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            await this.authRepository.upsertSession(user.id, refreshToken, expiresAt);

            await this.auditLogService.record({
                userId: user.id,
                action: "CREATE",
                resource: "auth",
                resourceId: user.id,
                context,
                details: {
                    email: user.email,
                    registerMethod: "password",
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
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError("El correo electrónico ya está registrado", "DATA_ALREADY_EXISTS", 409);
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error en la base de datos al registrar usuario", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
