import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import { UniqueConstraintError } from "@shared/db/database/errors/UniqueConstraintError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { AddTeamMemberInput, TeamMemberDetail } from "../domain/team.entity.js";
import type { TeamsRepository } from "../domain/teams.repository.js";

export class AddTeamMemberUseCase {
    constructor(
        private readonly repository: TeamsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        teamId: string,
        data: AddTeamMemberInput,
        auditContext?: AuditContext
    ): Promise<TeamMemberDetail> {
        try {
            const team = await this.repository.findById(teamId);
            if (!team) {
                throw new AppError("Equipo no encontrado", "DATA_NOT_FOUND", 404);
            }

            const user = await this.repository.findUserByEmail(data.email);
            if (!user) {
                throw new AppError("No existe un usuario registrado con ese correo electrónico", "USER_NOT_FOUND", 404);
            }

            const existingMember = await this.repository.findMemberByUserId(teamId, user.id);
            if (existingMember) {
                throw new AppError("El usuario ya es miembro de este equipo", "DATA_ALREADY_EXISTS", 409);
            }

            const role = data.role ?? "VIEWER";
            const member = await this.repository.addMember(teamId, user.id, role);

            await this.auditLogService.record({
                action: "CREATE",
                resource: "team_member",
                resourceId: member.id,
                context: auditContext,
                after: {
                    id: member.id,
                    teamId: member.teamId,
                    userId: member.userId,
                    role: member.role,
                    email: user.email,
                },
            });

            return member;
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError("El usuario ya es miembro de este equipo", "DATA_ALREADY_EXISTS", 409);
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error al agregar miembro al equipo", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
