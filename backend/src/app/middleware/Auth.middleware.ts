import type { Request, Response, NextFunction } from "express";
import type { TeamRole } from "@prisma/client";
import prisma from "@infrastructure/config/prisma/prisma.config.js";
import JwtProvider from "@modules/Auth/domain/jwt.provider.js";
import AppError from "@shared/errors/AppError.js";

export type AllowedTeamRole = TeamRole; // 'OWNER' | 'EDITOR' | 'VIEWER'

export class AuthMiddleware {
    private readonly jwtProvider: JwtProvider;

    constructor() {
        this.jwtProvider = new JwtProvider();
    }

    /**
     * Middleware principal para proteger rutas.
     * Valida el Bearer JWT (o cookie accessToken), verifica que exista una UserSession activa
     * y que el usuario esté activo (`isActive: true`).
     */
    public protegerRuta = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;
            let token: string | undefined;

            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            } else if (req.cookies?.accessToken) {
                token = req.cookies.accessToken;
            }

            if (!token) {
                throw new AppError("Unauthorized: Token not provided", "UNAUTHORIZED", 401);
            }

            const payload = await this.jwtProvider.verifyToken(String(token));
            if (!payload.sub) {
                throw new AppError("Invalid Token: missing subject", "INVALID_TOKEN", 401);
            }

            const user = await prisma.user.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                    isActive: true,
                    isVerify: true,
                    session: {
                        select: {
                            id: true,
                            expiresAt: true,
                        },
                    },
                },
            });

            if (!user || !user.isActive) {
                throw new AppError("Unauthorized: User not found or inactive", "UNAUTHORIZED", 401);
            }

            if (!user.session || user.session.expiresAt < new Date()) {
                throw new AppError("Unauthorized: Session expired or closed", "SESSION_EXPIRED", 401);
            }

            res.locals.user = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatarUrl: user.avatarUrl,
                isActive: user.isActive,
                isVerify: user.isVerify,
            };

            (req as any).user = res.locals.user;

            next();
        } catch (error: any) {
            if (error.code === "ERR_JWT_EXPIRED") {
                next(new AppError("The token has expired", "TOKEN_EXPIRED", 401));
                return;
            }

            if (error instanceof AppError) {
                next(error);
            } else {
                next(new AppError("Invalid Token", "INVALID_TOKEN", 401));
            }
        }
    };

    /**
     * Alias compatible con rutas existentes
     */
    public routeProtect = this.protegerRuta;

    /**
     * Resuelve el `teamId` desde params, body, query, header `x-team-id`,
     * o indirectamente desde recursos (:budgetId, :itemId, :expenseId, :incomeId, :categoryId).
     */
    private async resolveTeamId(req: Request): Promise<string | null> {
        const directTeamId =
            (req.params?.teamId as string | undefined) ||
            (req.body?.teamId as string | undefined) ||
            (typeof req.query?.teamId === "string" ? req.query.teamId : undefined) ||
            (typeof req.headers["x-team-id"] === "string" ? req.headers["x-team-id"] : undefined);

        if (directTeamId) {
            return directTeamId;
        }

        const budgetId = (req.params?.budgetId as string | undefined) || (req.body?.budgetId as string | undefined);
        if (budgetId) {
            const budget = await prisma.budget.findUnique({
                where: { id: budgetId },
                select: { teamId: true },
            });
            return budget?.teamId ?? null;
        }

        const itemId = (req.params?.itemId as string | undefined) || (req.body?.budgetItemId as string | undefined);
        if (itemId) {
            const item = await prisma.budgetItem.findUnique({
                where: { id: itemId },
                select: { budget: { select: { teamId: true } } },
            });
            return item?.budget?.teamId ?? null;
        }

        const expenseId = req.params?.expenseId as string | undefined;
        if (expenseId) {
            const expense = await prisma.expense.findUnique({
                where: { id: expenseId },
                select: { budgetItem: { select: { budget: { select: { teamId: true } } } } },
            });
            return expense?.budgetItem?.budget?.teamId ?? null;
        }

        const incomeId = req.params?.incomeId as string | undefined;
        if (incomeId) {
            const income = await prisma.income.findUnique({
                where: { id: incomeId },
                select: { budget: { select: { teamId: true } } },
            });
            return income?.budget?.teamId ?? null;
        }

        const categoryId = (req.params?.categoryId as string | undefined) || (req.body?.categoryId as string | undefined);
        if (categoryId) {
            const category = await prisma.incomeCategory.findUnique({
                where: { id: categoryId },
                select: { teamId: true },
            });
            return category?.teamId ?? null;
        }

        return null;
    }

    /**
     * Middleware RBAC por Team.
     * Verifica que el usuario autenticado pertenezca al Team con alguno de los roles permitidos
     * y adjunta `res.locals.teamId` y `res.locals.teamRole`.
     */
    public verifyTeamRole = (allowedRoles: TeamRole[]) => {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const user = res.locals.user || (req as any).user;
                if (!user?.id) {
                    throw new AppError("Unauthorized: User not authenticated", "UNAUTHORIZED", 401);
                }

                const teamId = await this.resolveTeamId(req);
                if (!teamId) {
                    throw new AppError("Team context (teamId) could not be resolved", "TEAM_ID_REQUIRED", 400);
                }

                const membership = await prisma.teamMember.findUnique({
                    where: {
                        teamId_userId: {
                            teamId,
                            userId: user.id,
                        },
                    },
                    select: {
                        role: true,
                    },
                });

                if (!membership || !allowedRoles.includes(membership.role)) {
                    throw new AppError("Not authorized to perform this action in this team", "FORBIDDEN", 403);
                }

                res.locals.teamId = teamId;
                res.locals.teamRole = membership.role;
                (req as any).teamId = teamId;
                (req as any).teamRole = membership.role;

                next();
            } catch (error) {
                next(error);
            }
        };
    };
}
