import { Router } from "express";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { teamsController } from "../teams.module.js";
import {
    addTeamMemberSchema,
    createTeamSchema,
    teamIdParamSchema,
    teamMemberParamSchema,
    updateTeamMemberRoleSchema,
    updateTeamSchema,
} from "./validators/team.schema.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

router.use(authMiddleware.protegerRuta);

router.get("/", teamsController.list);

router.post(
    "/",
    validatedMiddleware.validateBody(createTeamSchema),
    teamsController.create
);

router.get(
    "/:teamId",
    validatedMiddleware.validateParams(teamIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR", "VIEWER"]),
    teamsController.getById
);

router.put(
    "/:teamId",
    validatedMiddleware.validateParams(teamIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER"]),
    validatedMiddleware.validateBody(updateTeamSchema),
    teamsController.update
);

router.delete(
    "/:teamId",
    validatedMiddleware.validateParams(teamIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER"]),
    teamsController.delete
);

router.post(
    "/:teamId/members",
    validatedMiddleware.validateParams(teamIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER"]),
    validatedMiddleware.validateBody(addTeamMemberSchema),
    teamsController.addMember
);

router.patch(
    "/:teamId/members/:memberId",
    validatedMiddleware.validateParams(teamMemberParamSchema),
    authMiddleware.verifyTeamRole(["OWNER"]),
    validatedMiddleware.validateBody(updateTeamMemberRoleSchema),
    teamsController.updateMemberRole
);

router.delete(
    "/:teamId/members/:memberId",
    validatedMiddleware.validateParams(teamMemberParamSchema),
    authMiddleware.verifyTeamRole(["OWNER"]),
    teamsController.removeMember
);

export default router;
