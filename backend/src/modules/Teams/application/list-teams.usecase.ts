import { DatabaseError } from "@shared/db/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { TeamSummary } from "../domain/team.entity.js";
import type { TeamsRepository } from "../domain/teams.repository.js";

export class ListTeamsUseCase {
    constructor(private readonly repository: TeamsRepository) {}

    async execute(userId: string): Promise<TeamSummary[]> {
        try {
            return await this.repository.listByUser(userId);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al obtener los equipos", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
