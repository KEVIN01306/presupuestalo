import type { NextFunction, Request, Response } from "express";
import BaseController from "@presentation/base.controller.js";
import ResponseHttp from "@app/http/response.http.js";
import type { ListBudgetsUseCase } from "../application/list-budgets.usecase.js";
import type { GetPendingCarryoverUseCase } from "../application/get-pending-carryover.usecase.js";
import type { CreateBudgetUseCase } from "../application/create-budget.usecase.js";
import type { GetBudgetUseCase } from "../application/get-budget.usecase.js";
import type { UpdateBudgetUseCase } from "../application/update-budget.usecase.js";
import type { DeleteBudgetUseCase } from "../application/delete-budget.usecase.js";
import type { ApplyCarryoverUseCase } from "../application/apply-carryover.usecase.js";
import type { GetBudgetSummaryUseCase } from "../application/get-budget-summary.usecase.js";
import type { CloseBudgetUseCase } from "../application/close-budget.usecase.js";

export class BudgetsController extends BaseController {
    constructor(
        private readonly listBudgetsUseCase: ListBudgetsUseCase,
        private readonly getPendingCarryoverUseCase: GetPendingCarryoverUseCase,
        private readonly createBudgetUseCase: CreateBudgetUseCase,
        private readonly getBudgetUseCase: GetBudgetUseCase,
        private readonly updateBudgetUseCase: UpdateBudgetUseCase,
        private readonly deleteBudgetUseCase: DeleteBudgetUseCase,
        private readonly applyCarryoverUseCase: ApplyCarryoverUseCase,
        private readonly getBudgetSummaryUseCase: GetBudgetSummaryUseCase,
        private readonly closeBudgetUseCase: CloseBudgetUseCase
    ) {
        super();
    }

    list = async (req: Request<{ teamId: string }>, res: Response, next: NextFunction) => {
        try {
            const teamId = res.locals.teamId || req.params.teamId;
            const data = await this.listBudgetsUseCase.execute(teamId);
            res.status(200).json(ResponseHttp.success("Presupuestos obtenidos con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    getPendingCarryover = async (req: Request<{ teamId: string }>, res: Response, next: NextFunction) => {
        try {
            const teamId = res.locals.teamId || req.params.teamId;
            const data = await this.getPendingCarryoverUseCase.execute(teamId);
            res.status(200).json(ResponseHttp.success("Estado de sobrante obtenido con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request<{ teamId: string }>, res: Response, next: NextFunction) => {
        try {
            const teamId = res.locals.teamId || req.params.teamId;
            const auditContext = this.getAuditContext(req, res);
            const data = await this.createBudgetUseCase.execute(teamId, req.body, auditContext);
            res.status(201).json(ResponseHttp.success("Presupuesto creado con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request<{ budgetId: string }>, res: Response, next: NextFunction) => {
        try {
            const { budgetId } = req.params;
            const teamId = res.locals.teamId as string;
            const data = await this.getBudgetUseCase.execute(budgetId, teamId);
            res.status(200).json(ResponseHttp.success("Presupuesto obtenido con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request<{ budgetId: string }>, res: Response, next: NextFunction) => {
        try {
            const { budgetId } = req.params;
            const teamId = res.locals.teamId as string;
            const auditContext = this.getAuditContext(req, res);
            const data = await this.updateBudgetUseCase.execute(budgetId, teamId, req.body, auditContext);
            res.status(200).json(ResponseHttp.success("Presupuesto actualizado con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request<{ budgetId: string }>, res: Response, next: NextFunction) => {
        try {
            const { budgetId } = req.params;
            const teamId = res.locals.teamId as string;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteBudgetUseCase.execute(budgetId, teamId, auditContext);
            res.status(200).json(ResponseHttp.success("Presupuesto eliminado con éxito", null));
        } catch (error) {
            next(error);
        }
    };

    applyCarryover = async (req: Request<{ budgetId: string }>, res: Response, next: NextFunction) => {
        try {
            const { budgetId } = req.params;
            const teamId = res.locals.teamId as string;
            const auditContext = this.getAuditContext(req, res);
            const data = await this.applyCarryoverUseCase.execute(budgetId, teamId, auditContext);
            res.status(201).json(ResponseHttp.success("Sobrante aplicado al presupuesto con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    getSummary = async (req: Request<{ budgetId: string }>, res: Response, next: NextFunction) => {
        try {
            const { budgetId } = req.params;
            const teamId = res.locals.teamId as string;
            const currentUser = this.obtenerEntorno(res);
            const data = await this.getBudgetSummaryUseCase.execute(budgetId, teamId, currentUser.id);
            res.status(200).json(ResponseHttp.success("Resumen del presupuesto obtenido con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    close = async (req: Request<{ budgetId: string }>, res: Response, next: NextFunction) => {
        try {
            const { budgetId } = req.params;
            const teamId = res.locals.teamId as string;
            const auditContext = this.getAuditContext(req, res);
            const data = await this.closeBudgetUseCase.execute(budgetId, teamId, req.body, auditContext);
            res.status(201).json(ResponseHttp.success("Presupuesto cerrado con éxito", data));
        } catch (error) {
            next(error);
        }
    };
}
