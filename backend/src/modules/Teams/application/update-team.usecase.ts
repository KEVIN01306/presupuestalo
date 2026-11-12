import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { CurrenciesRepository } from "@modules/Currencies/domain/currencies.repository.js";
import type { Team, TeamUpdateInput } from "../domain/team.entity.js";
import type { TeamsRepository } from "../domain/teams.repository.js";

export class UpdateTeamUseCase {
    constructor(
        private readonly repository: TeamsRepository,
        private readonly currenciesRepository: CurrenciesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(teamId: string, data: TeamUpdateInput, auditContext?: AuditContext): Promise<Team> {
        try {
            const existing = await this.repository.findById(teamId);
            if (!existing) {
                throw new AppError("Equipo no encontrado", "DATA_NOT_FOUND", 404);
            }

            if (data.currencyId !== undefined) {
                const currency = await this.currenciesRepository.findById(data.currencyId);
                if (!currency || !currency.isActive) {
                    throw new AppError("La moneda seleccionada no existe o no está activa", "INVALID_DATA", 400);
                }
            }

            const updated = await this.repository.update(teamId, data);

            await this.auditLogService.record({
                action: "UPDATE",
                resource: "team",
                resourceId: teamId,
                context: auditContext,
                before: existing,
                after: updated,
            });

            return updated;
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("Equipo no encontrado", "DATA_NOT_FOUND", 404);
            }
            if (error instanceof DatabaseError) {
                throw new AppError("Error al actualizar el equipo", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
