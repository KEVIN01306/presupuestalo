import type { NextFunction, Request, Response } from "express";
import BaseController from "@presentation/base.controller.js";
import ResponseHttp from "@app/http/response.http.js";
import type { ListIncomeCategoriesUseCase } from "../application/list-income-categories.usecase.js";
import type { CreateIncomeCategoryUseCase } from "../application/create-income-category.usecase.js";
import type { UpdateIncomeCategoryUseCase } from "../application/update-income-category.usecase.js";
import type { DeleteIncomeCategoryUseCase } from "../application/delete-income-category.usecase.js";

export class IncomeCategoriesController extends BaseController {
    constructor(
        private readonly listIncomeCategoriesUseCase: ListIncomeCategoriesUseCase,
        private readonly createIncomeCategoryUseCase: CreateIncomeCategoryUseCase,
        private readonly updateIncomeCategoryUseCase: UpdateIncomeCategoryUseCase,
        private readonly deleteIncomeCategoryUseCase: DeleteIncomeCategoryUseCase
    ) {
        super();
    }

    list = async (req: Request<{ teamId: string }>, res: Response, next: NextFunction) => {
        try {
            const teamId = res.locals.teamId || req.params.teamId;
            const data = await this.listIncomeCategoriesUseCase.execute(teamId);
            res.status(200).json(ResponseHttp.success("Categorías de ingreso obtenidas con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request<{ teamId: string }>, res: Response, next: NextFunction) => {
        try {
            const teamId = res.locals.teamId || req.params.teamId;
            const auditContext = this.getAuditContext(req, res);
            const data = await this.createIncomeCategoryUseCase.execute(teamId, req.body, auditContext);
            res.status(201).json(ResponseHttp.success("Categoría de ingreso creada con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    update = async (
        req: Request<{ teamId: string; categoryId: string }>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const teamId = res.locals.teamId || req.params.teamId;
            const { categoryId } = req.params;
            const auditContext = this.getAuditContext(req, res);
            const data = await this.updateIncomeCategoryUseCase.execute(categoryId, teamId, req.body, auditContext);
            res.status(200).json(ResponseHttp.success("Categoría de ingreso actualizada con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    delete = async (
        req: Request<{ teamId: string; categoryId: string }>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const teamId = res.locals.teamId || req.params.teamId;
            const { categoryId } = req.params;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteIncomeCategoryUseCase.execute(categoryId, teamId, auditContext);
            res.status(200).json(ResponseHttp.success("Categoría de ingreso eliminada con éxito", null));
        } catch (error) {
            next(error);
        }
    };
}
