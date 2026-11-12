import type { NextFunction, Request, Response } from "express";
import BaseController from "@presentation/base.controller.js";
import ResponseHttp from "@app/http/response.http.js";
import type { ListTeamsUseCase } from "../application/list-teams.usecase.js";
import type { GetTeamUseCase } from "../application/get-team.usecase.js";
import type { CreateTeamUseCase } from "../application/create-team.usecase.js";
import type { UpdateTeamUseCase } from "../application/update-team.usecase.js";
import type { DeleteTeamUseCase } from "../application/delete-team.usecase.js";
import type { AddTeamMemberUseCase } from "../application/add-team-member.usecase.js";
import type { UpdateTeamMemberRoleUseCase } from "../application/update-team-member-role.usecase.js";
import type { RemoveTeamMemberUseCase } from "../application/remove-team-member.usecase.js";

export class TeamsController extends BaseController {
    constructor(
        private readonly listTeamsUseCase: ListTeamsUseCase,
        private readonly getTeamUseCase: GetTeamUseCase,
        private readonly createTeamUseCase: CreateTeamUseCase,
        private readonly updateTeamUseCase: UpdateTeamUseCase,
        private readonly deleteTeamUseCase: DeleteTeamUseCase,
        private readonly addTeamMemberUseCase: AddTeamMemberUseCase,
        private readonly updateTeamMemberRoleUseCase: UpdateTeamMemberRoleUseCase,
        private readonly removeTeamMemberUseCase: RemoveTeamMemberUseCase
    ) {
        super();
    }

    list = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const user = this.obtenerEntorno(res);
            const data = await this.listTeamsUseCase.execute(user.id);
            res.status(200).json(ResponseHttp.success("Equipos obtenidos con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request<{ teamId: string }>, res: Response, next: NextFunction) => {
        try {
            const { teamId } = req.params;
            const data = await this.getTeamUseCase.execute(teamId);
            res.status(200).json(ResponseHttp.success("Equipo obtenido con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = this.obtenerEntorno(res);
            const auditContext = this.getAuditContext(req, res);
            const data = await this.createTeamUseCase.execute(req.body, user.id, auditContext);
            res.status(201).json(ResponseHttp.success("Equipo creado con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request<{ teamId: string }>, res: Response, next: NextFunction) => {
        try {
            const { teamId } = req.params;
            const auditContext = this.getAuditContext(req, res);
            const data = await this.updateTeamUseCase.execute(teamId, req.body, auditContext);
            res.status(200).json(ResponseHttp.success("Equipo actualizado con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request<{ teamId: string }>, res: Response, next: NextFunction) => {
        try {
            const { teamId } = req.params;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteTeamUseCase.execute(teamId, auditContext);
            res.status(200).json(ResponseHttp.success("Equipo eliminado con éxito", null));
        } catch (error) {
            next(error);
        }
    };

    addMember = async (req: Request<{ teamId: string }>, res: Response, next: NextFunction) => {
        try {
            const { teamId } = req.params;
            const auditContext = this.getAuditContext(req, res);
            const data = await this.addTeamMemberUseCase.execute(teamId, req.body, auditContext);
            res.status(201).json(ResponseHttp.success("Miembro agregado al equipo con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    updateMemberRole = async (
        req: Request<{ teamId: string; memberId: string }>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { teamId, memberId } = req.params;
            const auditContext = this.getAuditContext(req, res);
            const data = await this.updateTeamMemberRoleUseCase.execute(teamId, memberId, req.body, auditContext);
            res.status(200).json(ResponseHttp.success("Rol del miembro actualizado con éxito", data));
        } catch (error) {
            next(error);
        }
    };

    removeMember = async (
        req: Request<{ teamId: string; memberId: string }>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { teamId, memberId } = req.params;
            const auditContext = this.getAuditContext(req, res);
            await this.removeTeamMemberUseCase.execute(teamId, memberId, auditContext);
            res.status(200).json(ResponseHttp.success("Miembro expulsado del equipo con éxito", null));
        } catch (error) {
            next(error);
        }
    };
}
