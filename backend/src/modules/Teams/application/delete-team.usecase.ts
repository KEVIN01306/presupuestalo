import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { TeamsRepository } from "../domain/teams.repository.js";

export class DeleteTeamUseCase {
    constructor(
        private readonly repository: TeamsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(teamId: string, auditContext?: AuditContext): Promise<void> {
        try {
            const existing = await this.repository.findById(teamId);
            if (!existing) {
                throw new AppError("Equipo no encontrado", "DATA_NOT_FOUND", 404);
            }

            if (existing.isPersonal) {
                throw new AppError("No se puede eliminar un equipo personal", "PERSONAL_TEAM_PROTECTED", 400);
            }

            await this.repository.delete(teamId);

            await this.auditLogService.record({
                action: "DELETE",
                resource: "team",
                resourceId: teamId,
                context: auditContext,
                before: existing,
            });
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("Equipo no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error al eliminar el equipo", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
