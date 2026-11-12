import type { Request, Response, NextFunction } from "express";
import ResponseHttp from "@app/http/response.http.js";
import type { ListAuditLogsUseCase } from "../application/list-audit-logs.usecase.js";
import type { GetAuditLogByIdUseCase } from "../application/get-audit-log-by-id.usecase.js";
import type { AuditAction, AuditFilters } from "../domain/audit-log.entity.js";
import BaseController from "@presentation/base.controller.js";

export class AuditController extends BaseController {
    constructor(
        private readonly listAuditLogsUseCase: ListAuditLogsUseCase,
        private readonly getAuditLogByIdUseCase: GetAuditLogByIdUseCase
    ) {
        super();
    }

    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const currentUser = this.obtenerEntorno(res);
            const page = req.query.page ? Math.max(1, parseInt(req.query.page as string, 10)) : 1;
            const limit = req.query.limit ? Math.max(1, parseInt(req.query.limit as string, 10)) : 10;
            const offset = (page - 1) * limit;

            const filters: AuditFilters = {
                userId: currentUser.id,
            };

            if (req.query.action) {
                filters.action = req.query.action as AuditAction;
            }
            if (req.query.resource) {
                filters.resource = String(req.query.resource).toLowerCase().trim();
            }
            if (req.query.resourceId) {
                filters.resourceId = String(req.query.resourceId);
            }
            if (req.query.q) {
                filters.q = String(req.query.q);
            }
            if (req.query.dateFrom) {
                filters.dateFrom = String(req.query.dateFrom);
            }
            if (req.query.dateTo) {
                filters.dateTo = String(req.query.dateTo);
            }

            const { data, total } = await this.listAuditLogsUseCase.execute({
                page,
                limit,
                filters
            });

            return res.status(200).json(
                ResponseHttp.pagination("Audit logs fetched successfully", data, total, limit, offset)
            );
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const log = await this.getAuditLogByIdUseCase.execute(id);

            return res.status(200).json(
                ResponseHttp.success("Audit log fetched successfully", log)
            );
        } catch (error) {
            next(error);
        }
    };
}

