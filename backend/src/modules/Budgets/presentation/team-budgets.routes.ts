import { Router } from "express";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { budgetsController } from "../budgets.module.js";
import { createBudgetSchema, teamBudgetParamSchema } from "./validators/budget.schema.js";

const router = Router({ mergeParams: true });
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

router.use(authMiddleware.protegerRuta);

router.get(
    "/pending-carryover",
    validatedMiddleware.validateParams(teamBudgetParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR", "VIEWER"]),
    budgetsController.getPendingCarryover
);

router.get(
    "/",
    validatedMiddleware.validateParams(teamBudgetParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR", "VIEWER"]),
    budgetsController.list
);

router.post(
    "/",
    validatedMiddleware.validateParams(teamBudgetParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR"]),
    validatedMiddleware.validateBody(createBudgetSchema),
    budgetsController.create
);

export default router;
