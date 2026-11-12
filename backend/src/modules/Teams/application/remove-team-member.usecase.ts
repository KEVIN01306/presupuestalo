import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { TeamsRepository } from "../domain/teams.repository.js";

export class RemoveTeamMemberUseCase {
    constructor(
        private readonly repository: TeamsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(teamId: string, memberId: string, auditContext?: AuditContext): Promise<void> {
        try {
            const team = await this.repository.findById(teamId);
            if (!team) {
                throw new AppError("Equipo no encontrado", "DATA_NOT_FOUND", 404);
            }

            const member = await this.repository.findMemberById(teamId, memberId);
            if (!member) {
                throw new AppError("Miembro no encontrado en el equipo", "DATA_NOT_FOUND", 404);
            }

            if (team.ownerId === member.userId) {
                throw new AppError(
                    "No se puede expulsar al propietario principal del equipo",
                    "OWNER_CANNOT_BE_REMOVED",
                    400
                );
            }

            await this.repository.removeMember(teamId, memberId);

            await this.auditLogService.record({
                action: "DELETE",
                resource: "team_member",
                resourceId: memberId,
                context: auditContext,
                before: {
                    id: member.id,
                    teamId: member.teamId,
                    userId: member.userId,
                    role: member.role,
                    email: member.user.email,
                },
            });
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("Miembro no encontrado en el equipo", "DATA_NOT_FOUND", 404);
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error al expulsar al miembro del equipo", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
