import { Router } from "express";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { budgetsController } from "../budgets.module.js";
import { budgetIdParamSchema, closeBudgetSchema, updateBudgetSchema } from "./validators/budget.schema.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

router.use(authMiddleware.protegerRuta);

router.get(
    "/:budgetId/summary",
    validatedMiddleware.validateParams(budgetIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR", "VIEWER"]),
    budgetsController.getSummary
);

router.post(
    "/:budgetId/close",
    validatedMiddleware.validateParams(budgetIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR"]),
    validatedMiddleware.validateBody(closeBudgetSchema),
    budgetsController.close
);

router.get(
    "/:budgetId",
    validatedMiddleware.validateParams(budgetIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR", "VIEWER"]),
    budgetsController.getById
);

router.put(
    "/:budgetId",
    validatedMiddleware.validateParams(budgetIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR"]),
    validatedMiddleware.validateBody(updateBudgetSchema),
    budgetsController.update
);

router.delete(
    "/:budgetId",
    validatedMiddleware.validateParams(budgetIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER"]),
    budgetsController.delete
);

router.post(
    "/:budgetId/apply-carryover",
    validatedMiddleware.validateParams(budgetIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR"]),
    budgetsController.applyCarryover
);

export default router;
