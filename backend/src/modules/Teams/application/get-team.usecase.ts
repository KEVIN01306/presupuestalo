import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { TeamDetail } from "../domain/team.entity.js";
import type { TeamsRepository } from "../domain/teams.repository.js";

export class GetTeamUseCase {
    constructor(private readonly repository: TeamsRepository) {}

    async execute(teamId: string): Promise<TeamDetail> {
        try {
            const team = await this.repository.findByIdWithMembers(teamId);
            if (!team) {
                throw new AppError("Equipo no encontrado", "DATA_NOT_FOUND", 404);
            }
            return team;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al obtener el equipo", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
