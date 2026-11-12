import type { NextFunction, Request, Response } from "express";
import BaseController from "@presentation/base.controller.js";
import ResponseHttp from "@app/http/response.http.js";
import type { ListIncomesUseCase } from "../application/list-incomes.usecase.js";
import type { CreateIncomeUseCase } from "../application/create-income.usecase.js";
import type { UpdateIncomeUseCase } from "../application/update-income.usecase.js";
import type { DeleteIncomeUseCase } from "../application/delete-income.usecase.js";

export class IncomesController extends BaseController {
    constructor(
        private readonly listIncomesUseCase: ListIncomesUseCase,
        private readonly createIncomeUseCase: CreateIncomeUseCase,
        private readonly updateIncomeUseCase: UpdateIncomeUseCase,
        private readonly deleteIncomeUseCase: DeleteIncomeUseCase
    ) {
        super();
    }

    list = async (req: Request<{ budgetId: string }>, res: Response, next: NextFunction) => {
        try {
            const { budgetId } = req.params;
            const teamId = res.locals.teamId as string;
            const data = await this.listIncomesUseCase.execute(budgetId, teamId);
            res.status(200).json(ResponseHttp.success("Ingresos obtenidos con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request<{ budgetId: string }>, res: Response, next: NextFunction) => {
        try {
            const { budgetId } = req.params;
            const teamId = res.locals.teamId as string;
            const auditContext = this.getAuditContext(req, res);
            const data = await this.createIncomeUseCase.execute(budgetId, teamId, req.body, auditContext);
            res.status(201).json(ResponseHttp.success("Ingreso registrado con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request<{ incomeId: string }>, res: Response, next: NextFunction) => {
        try {
            const { incomeId } = req.params;
            const teamId = res.locals.teamId as string;
            const auditContext = this.getAuditContext(req, res);
            const data = await this.updateIncomeUseCase.execute(incomeId, teamId, req.body, auditContext);
            res.status(200).json(ResponseHttp.success("Ingreso actualizado con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request<{ incomeId: string }>, res: Response, next: NextFunction) => {
        try {
            const { incomeId } = req.params;
            const teamId = res.locals.teamId as string;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteIncomeUseCase.execute(incomeId, teamId, auditContext);
            res.status(200).json(ResponseHttp.success("Ingreso eliminado con éxito", null));
        } catch (error) {
            next(error);
        }
    };
}
