import type { AuthTeamMembership, AuthUser, TeamRole } from "../../domain/auth-user.entity.js";

export class AuthMapper {
    static toDomain(user: any): AuthUser {
        const teamMemberships: AuthTeamMembership[] = Array.isArray(user.teamMemberships)
            ? user.teamMemberships.map((tm: any) => ({
                  teamId: tm.teamId,
                  role: tm.role as TeamRole,
                  joinedAt: tm.joinedAt,
                  team: {
                      id: tm.team.id,
                      name: tm.team.name,
                      description: tm.team.description ?? null,
                      isPersonal: Boolean(tm.team.isPersonal),
                      ownerId: tm.team.ownerId,
                      currencyId: tm.team.currencyId ?? null,
                      currency: tm.team.currency
                          ? {
                                id: tm.team.currency.id,
                                code: tm.team.currency.code,
                                name: tm.team.currency.name,
                                symbol: tm.team.currency.symbol,
                            }
                          : null,
                  },
              }))
            : [];

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            passwordHash: user.passwordHash ?? null,
            googleId: user.googleId ?? null,
            avatarUrl: user.avatarUrl ?? null,
            isActive: Boolean(user.isActive),
            isVerify: Boolean(user.isVerify),
            teamMemberships,
            createdAt: user.createdAt,
        };
    }
}
