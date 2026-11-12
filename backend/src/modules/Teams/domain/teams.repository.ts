import type {
    Team,
    TeamCreateInput,
    TeamDetail,
    TeamMemberDetail,
    TeamOwnerSummary,
    TeamRoleType,
    TeamSummary,
    TeamUpdateInput,
} from "./team.entity.js";

export interface TeamsRepository {
    listByUser(userId: string): Promise<TeamSummary[]>;
    findById(teamId: string): Promise<Team | null>;
    findByIdWithMembers(teamId: string): Promise<TeamDetail | null>;
    createSharedTeam(data: TeamCreateInput, ownerId: string): Promise<TeamDetail>;
    update(teamId: string, data: TeamUpdateInput): Promise<Team>;
    delete(teamId: string): Promise<void>;
    findUserByEmail(email: string): Promise<TeamOwnerSummary | null>;
    findMemberById(teamId: string, memberId: string): Promise<TeamMemberDetail | null>;
    findMemberByUserId(teamId: string, userId: string): Promise<TeamMemberDetail | null>;
    countOwners(teamId: string): Promise<number>;
    addMember(teamId: string, userId: string, role: TeamRoleType): Promise<TeamMemberDetail>;
    updateMemberRole(teamId: string, memberId: string, role: TeamRoleType): Promise<TeamMemberDetail>;
    removeMember(teamId: string, memberId: string): Promise<void>;
}
