import type { Request, Response, NextFunction } from "express";
import ResponseHttp from "@app/http/response.http.js";
import BaseController from "@presentation/base.controller.js";
import type { CreateUserUseCase } from "../application/create-user.usecase.js";
import type { UpdateUserUseCase } from "../application/update-user.usecase.js";
import type { ListUsersUseCase } from "../application/list-users.usecase.js";
import type { ActivateUserUseCase } from "../application/activate-user.usecase.js";
import type { DisableUserUseCase } from "../application/disable-user.usecase.js";
import type { DeleteUserUseCase } from "../application/delete-user.usecase.js";
import type { ChangePasswordUseCase } from "../application/change-password.usecase.js";
import type { LookupUserByEmailUseCase } from "../application/lookup-user-by-email.usecase.js";
import type { UsersRepository } from "../domain/users.repository.js";
import type { HashProvider } from "@shared/domain/hash.provider.js";
import AppError from "@shared/errors/AppError.js";

export class UsersController extends BaseController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly listUsersUseCase: ListUsersUseCase,
        private readonly activateUserUseCase: ActivateUserUseCase,
        private readonly disableUserUseCase: DisableUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly changePasswordUseCase: ChangePasswordUseCase,
        private readonly lookupUserByEmailUseCase: LookupUserByEmailUseCase,
        private readonly usersRepository: UsersRepository,
        private readonly hashProvider: HashProvider
    ) {
        super();
    }

    getProfile = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const currentUser = this.obtenerEntorno(res);
            const user = await this.usersRepository.findById(currentUser.id);
            if (!user) {
                throw new AppError("User not found", "USER_NOT_FOUND", 404);
            }
            return res.status(200).json(ResponseHttp.success("Profile fetched successfully", user));
        } catch (error) {
            next(error);
        }
    };

    updateProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const currentUser = this.obtenerEntorno(res);
            const auditContext = this.getAuditContext(req, res);
            const updated = await this.updateUserUseCase.execute(currentUser.id, req.body, auditContext);
            return res.status(200).json(ResponseHttp.success("Profile updated successfully", updated));
        } catch (error) {
            next(error);
        }
    };

    lookupByEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = res.locals.query as { email: string };
            const user = await this.lookupUserByEmailUseCase.execute(email);
            return res.status(200).json(ResponseHttp.success("User found", user));
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const auditContext = this.getAuditContext(req, res);
            const user = await this.createUserUseCase.execute(data, auditContext);
            return res.status(201).json(ResponseHttp.success("User created successfully", user));
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const data = req.body;
            const auditContext = this.getAuditContext(req, res);

            let passwordHash = undefined;
            if (data.passwordRaw) {
                passwordHash = await this.hashProvider.hash(data.passwordRaw);
            }

            const updateData = {
                ...data,
                passwordHash,
            };

            const user = await this.updateUserUseCase.execute(id, updateData, auditContext);
            return res.status(200).json(ResponseHttp.success("User updated successfully", user));
        } catch (error) {
            next(error);
        }
    };

    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = req.query.page ? Math.max(1, parseInt(req.query.page as string, 10)) : 1;
            const limit = req.query.limit ? Math.max(1, parseInt(req.query.limit as string, 10)) : 10;
            const q = req.query.q ? String(req.query.q) : undefined;
            const offset = (page - 1) * limit;

            const { data, total } = await this.listUsersUseCase.execute({ page, limit, q });
            return res.status(200).json(ResponseHttp.pagination("Users fetched successfully", data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    };

    activate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            const user = await this.activateUserUseCase.execute(id, auditContext);
            return res.status(200).json(ResponseHttp.success("User reactivated successfully", user));
        } catch (error) {
            next(error);
        }
    };

    disable = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            const user = await this.disableUserUseCase.execute(id, auditContext);
            return res.status(200).json(ResponseHttp.success("User disabled successfully", user));
        } catch (error) {
            next(error);
        }
    };

    changePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userCtx = this.obtenerEntorno(res);
            const auditContext = this.getAuditContext(req, res);
            await this.changePasswordUseCase.execute(userCtx.id, req.body, auditContext);
            return res.status(200).json(ResponseHttp.success("Password changed successfully", null));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            const user = await this.deleteUserUseCase.execute(id, auditContext);
            return res.status(200).json(ResponseHttp.success("User deleted successfully", user));
        } catch (error) {
            next(error);
        }
    };
}
