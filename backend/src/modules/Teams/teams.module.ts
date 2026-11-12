import prisma from "@infrastructure/config/prisma/prisma.config.js";
import { auditLogService } from "@modules/Audit/audit.module.js";
import { currenciesRepository } from "@modules/Currencies/currencies.module.js";
import { PrismaTeamsRepository } from "./infrastructure/prisma-teams.repository.js";
import { ListTeamsUseCase } from "./application/list-teams.usecase.js";
import { GetTeamUseCase } from "./application/get-team.usecase.js";
import { CreateTeamUseCase } from "./application/create-team.usecase.js";
import { UpdateTeamUseCase } from "./application/update-team.usecase.js";
import { DeleteTeamUseCase } from "./application/delete-team.usecase.js";
import { AddTeamMemberUseCase } from "./application/add-team-member.usecase.js";
import { UpdateTeamMemberRoleUseCase } from "./application/update-team-member-role.usecase.js";
import { RemoveTeamMemberUseCase } from "./application/remove-team-member.usecase.js";
import { TeamsController } from "./presentation/teams.controller.js";

const repository = new PrismaTeamsRepository(prisma);

const listTeamsUseCase = new ListTeamsUseCase(repository);
const getTeamUseCase = new GetTeamUseCase(repository);
const createTeamUseCase = new CreateTeamUseCase(repository, currenciesRepository, auditLogService);
const updateTeamUseCase = new UpdateTeamUseCase(repository, currenciesRepository, auditLogService);
const deleteTeamUseCase = new DeleteTeamUseCase(repository, auditLogService);
const addTeamMemberUseCase = new AddTeamMemberUseCase(repository, auditLogService);
const updateTeamMemberRoleUseCase = new UpdateTeamMemberRoleUseCase(repository, auditLogService);
const removeTeamMemberUseCase = new RemoveTeamMemberUseCase(repository, auditLogService);

export const teamsController = new TeamsController(
    listTeamsUseCase,
    getTeamUseCase,
    createTeamUseCase,
    updateTeamUseCase,
    deleteTeamUseCase,
    addTeamMemberUseCase,
    updateTeamMemberRoleUseCase,
    removeTeamMemberUseCase
);
