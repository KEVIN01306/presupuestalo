import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import type { CurrenciesRepository } from "@modules/Currencies/domain/currencies.repository.js";
import type { TeamCreateInput, TeamDetail } from "../domain/team.entity.js";
import type { TeamsRepository } from "../domain/teams.repository.js";

export class CreateTeamUseCase {
    constructor(
        private readonly repository: TeamsRepository,
        private readonly currenciesRepository: CurrenciesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(data: TeamCreateInput, ownerId: string, auditContext?: AuditContext): Promise<TeamDetail> {
        try {
            let currencyId = data.currencyId ?? null;
            if (currencyId) {
                const currency = await this.currenciesRepository.findById(currencyId);
                if (!currency || !currency.isActive) {
                    throw new AppError("La moneda seleccionada no existe o no está activa", "INVALID_DATA", 400);
                }
            } else {
                const usdCurrency = await this.currenciesRepository.findByCode("USD");
                currencyId = usdCurrency?.id ?? null;
            }

            const team = await this.repository.createSharedTeam({ ...data, currencyId }, ownerId);

            await this.auditLogService.record({
                action: "CREATE",
                resource: "team",
                resourceId: team.id,
                userId: ownerId,
                context: auditContext,
                after: {
                    id: team.id,
                    name: team.name,
                    description: team.description,
                    isPersonal: team.isPersonal,
                    ownerId: team.ownerId,
                    currencyId: team.currencyId,
                },
            });

            return team;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al crear el equipo", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
