import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { TeamMemberDetail, UpdateTeamMemberRoleInput } from "../domain/team.entity.js";
import type { TeamsRepository } from "../domain/teams.repository.js";

export class UpdateTeamMemberRoleUseCase {
    constructor(
        private readonly repository: TeamsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        teamId: string,
        memberId: string,
        data: UpdateTeamMemberRoleInput,
        auditContext?: AuditContext
    ): Promise<TeamMemberDetail> {
        try {
            const team = await this.repository.findById(teamId);
            if (!team) {
                throw new AppError("Equipo no encontrado", "DATA_NOT_FOUND", 404);
            }

            const member = await this.repository.findMemberById(teamId, memberId);
            if (!member) {
                throw new AppError("Miembro no encontrado en el equipo", "DATA_NOT_FOUND", 404);
            }

            if (team.ownerId === member.userId && data.role !== "OWNER") {
                throw new AppError(
                    "No se puede degradar el rol del propietario principal del equipo",
                    "OWNER_ROLE_PROTECTED",
                    400
                );
            }

            if (member.role === "OWNER" && data.role !== "OWNER") {
                const ownersCount = await this.repository.countOwners(teamId);
                if (ownersCount <= 1) {
                    throw new AppError(
                        "El equipo debe tener al menos un propietario (OWNER)",
                        "LAST_OWNER_PROTECTED",
                        400
                    );
                }
            }

            const updated = await this.repository.updateMemberRole(teamId, memberId, data.role);

            await this.auditLogService.record({
                action: "UPDATE",
                resource: "team_member",
                resourceId: memberId,
                context: auditContext,
                before: { role: member.role, teamId, userId: member.userId },
                after: { role: updated.role, teamId, userId: updated.userId },
            });

            return updated;
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("Miembro no encontrado en el equipo", "DATA_NOT_FOUND", 404);
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error al actualizar el rol del miembro", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
