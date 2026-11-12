import { OAuth2Client } from "google-auth-library";
import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import type { AuthRepository } from "../domain/auth.repository.js";
import type { AuthTeamMembership } from "../domain/auth-user.entity.js";
import type JwtProvider from "../domain/jwt.provider.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";

export interface GoogleLoginDTO {
    idToken: string;
}

export interface GoogleLoginResponse {
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

export class GoogleLoginUseCase {
    private readonly oauthClient: OAuth2Client;

    constructor(
        private readonly authRepository: AuthRepository,
        private readonly jwtProvider: JwtProvider,
        private readonly auditLogService: AuditLogService
    ) {
        this.oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }

    async execute(data: GoogleLoginDTO, context?: AuditContext): Promise<GoogleLoginResponse> {
        try {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            if (!clientId) {
                throw new AppError("GOOGLE_CLIENT_ID no está configurado en el servidor", "MISSING_ENV_VARS", 500);
            }

            let payload;
            try {
                const ticket = await this.oauthClient.verifyIdToken({
                    idToken: data.idToken,
                    audience: clientId,
                });
                payload = ticket.getPayload();
            } catch {
                throw new AppError("Token de Google inválido o expirado", "INVALID_GOOGLE_TOKEN", 401);
            }

            if (!payload || !payload.email || !payload.sub) {
                throw new AppError("Token de Google inválido: faltan datos del usuario", "INVALID_GOOGLE_TOKEN", 401);
            }

            const googleId = payload.sub;
            const normalizedEmail = payload.email.toLowerCase().trim();

            let user = await this.authRepository.findByGoogleId(googleId);
            let isNewUser = false;

            if (!user) {
                user = await this.authRepository.findByEmail(normalizedEmail);
                if (user) {
                    if (!user.isActive) {
                        throw new AppError("User is inactive", "USER_INACTIVE", 403);
                    }
                    user = await this.authRepository.linkGoogleAccount(
                        user.id,
                        googleId,
                        payload.picture ?? null
                    );
                } else {
                    const firstName =
                        payload.given_name?.trim() ||
                        payload.name?.split(" ")[0]?.trim() ||
                        "Usuario";
                    const lastName =
                        payload.family_name?.trim() ||
                        payload.name?.split(" ").slice(1).join(" ").trim() ||
                        "Google";

                    user = await this.authRepository.createWithPersonalSpace({
                        email: normalizedEmail,
                        googleId,
                        firstName,
                        lastName,
                        avatarUrl: payload.picture ?? null,
                        isVerify: true,
                    });
                    isNewUser = true;
                }
            }

            if (!user.isActive) {
                throw new AppError("User is inactive", "USER_INACTIVE", 403);
            }

            const { accessToken, refreshToken } = await this.jwtProvider.generateTokens(
                user.id,
                user.email
            );

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            await this.authRepository.upsertSession(user.id, refreshToken, expiresAt);

            if (isNewUser) {
                await this.auditLogService.record({
                    userId: user.id,
                    action: "CREATE",
                    resource: "auth",
                    resourceId: user.id,
                    context,
                    details: {
                        email: user.email,
                        registerMethod: "google",
                    },
                });
            }

            await this.auditLogService.record({
                userId: user.id,
                action: "LOGIN",
                resource: "auth",
                resourceId: user.id,
                context,
                details: {
                    email: user.email,
                    loginMethod: "google",
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
            if (error instanceof DatabaseError) {
                throw new AppError("Error en la base de datos", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
