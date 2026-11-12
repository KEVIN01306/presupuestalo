import type { NextFunction, Request, Response } from "express";
import BaseController from "@presentation/base.controller.js";
import ResponseHttp from "@app/http/response.http.js";
import type { ListExpensesUseCase } from "../application/list-expenses.usecase.js";
import type { CreateExpenseUseCase } from "../application/create-expense.usecase.js";
import type { UpdateExpenseUseCase } from "../application/update-expense.usecase.js";
import type { DeleteExpenseUseCase } from "../application/delete-expense.usecase.js";

export class ExpensesController extends BaseController {
    constructor(
        private readonly listExpensesUseCase: ListExpensesUseCase,
        private readonly createExpenseUseCase: CreateExpenseUseCase,
        private readonly updateExpenseUseCase: UpdateExpenseUseCase,
        private readonly deleteExpenseUseCase: DeleteExpenseUseCase
    ) {
        super();
    }

    list = async (req: Request<{ budgetId: string }>, res: Response, next: NextFunction) => {
        try {
            const { budgetId } = req.params;
            const teamId = res.locals.teamId as string;
            const filters = (res.locals.query ?? {}) as {
                budgetItemId?: string;
                paidByUserId?: string;
            };
            const data = await this.listExpensesUseCase.execute(budgetId, teamId, filters);
            res.status(200).json(ResponseHttp.success("Gastos obtenidos con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request<{ budgetId: string }>, res: Response, next: NextFunction) => {
        try {
            const { budgetId } = req.params;
            const teamId = res.locals.teamId as string;
            const currentUser = this.obtenerEntorno(res);
            const auditContext = this.getAuditContext(req, res);
            const data = await this.createExpenseUseCase.execute(
                budgetId,
                teamId,
                currentUser.id,
                req.body,
                auditContext
            );
            res.status(201).json(ResponseHttp.success("Gasto registrado con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request<{ expenseId: string }>, res: Response, next: NextFunction) => {
        try {
            const { expenseId } = req.params;
            const teamId = res.locals.teamId as string;
            const auditContext = this.getAuditContext(req, res);
            const data = await this.updateExpenseUseCase.execute(
                expenseId,
                teamId,
                req.body,
                auditContext
            );
            res.status(200).json(ResponseHttp.success("Gasto actualizado con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request<{ expenseId: string }>, res: Response, next: NextFunction) => {
        try {
            const { expenseId } = req.params;
            const teamId = res.locals.teamId as string;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteExpenseUseCase.execute(expenseId, teamId, auditContext);
            res.status(200).json(ResponseHttp.success("Gasto eliminado con éxito", null));
        } catch (error) {
            next(error);
        }
    };
}
