import type { NextFunction, Request, Response } from "express";
import BaseController from "@presentation/base.controller.js";
import ResponseHttp from "@app/http/response.http.js";
import type { ListBudgetItemsUseCase } from "../application/list-budget-items.usecase.js";
import type { CreateBudgetItemUseCase } from "../application/create-budget-item.usecase.js";
import type { UpdateBudgetItemUseCase } from "../application/update-budget-item.usecase.js";
import type { DeleteBudgetItemUseCase } from "../application/delete-budget-item.usecase.js";

export class BudgetItemsController extends BaseController {
    constructor(
        private readonly listBudgetItemsUseCase: ListBudgetItemsUseCase,
        private readonly createBudgetItemUseCase: CreateBudgetItemUseCase,
        private readonly updateBudgetItemUseCase: UpdateBudgetItemUseCase,
        private readonly deleteBudgetItemUseCase: DeleteBudgetItemUseCase
    ) {
        super();
    }

    list = async (req: Request<{ budgetId: string }>, res: Response, next: NextFunction) => {
        try {
            const { budgetId } = req.params;
            const teamId = res.locals.teamId as string;
            const data = await this.listBudgetItemsUseCase.execute(budgetId, teamId);
            res.status(200).json(ResponseHttp.success("Rubros obtenidos con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request<{ budgetId: string }>, res: Response, next: NextFunction) => {
        try {
            const { budgetId } = req.params;
            const teamId = res.locals.teamId as string;
            const auditContext = this.getAuditContext(req, res);
            const data = await this.createBudgetItemUseCase.execute(budgetId, teamId, req.body, auditContext);
            res.status(201).json(ResponseHttp.success("Rubro creado con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request<{ itemId: string }>, res: Response, next: NextFunction) => {
        try {
            const { itemId } = req.params;
            const teamId = res.locals.teamId as string;
            const auditContext = this.getAuditContext(req, res);
            const data = await this.updateBudgetItemUseCase.execute(itemId, teamId, req.body, auditContext);
            res.status(200).json(ResponseHttp.success("Rubro actualizado con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request<{ itemId: string }>, res: Response, next: NextFunction) => {
        try {
            const { itemId } = req.params;
            const teamId = res.locals.teamId as string;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteBudgetItemUseCase.execute(itemId, teamId, auditContext);
            res.status(200).json(ResponseHttp.success("Rubro eliminado con éxito", null));
        } catch (error) {
            next(error);
        }
    };
}
