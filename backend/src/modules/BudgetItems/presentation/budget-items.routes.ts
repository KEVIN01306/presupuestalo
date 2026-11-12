import { Router } from "express";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { budgetItemsController } from "../budget-items.module.js";
import { budgetIdParamSchema, createBudgetItemSchema } from "./validators/budget-item.schema.js";

const router = Router({ mergeParams: true });
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

router.use(authMiddleware.protegerRuta);

router.get(
    "/",
    validatedMiddleware.validateParams(budgetIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR", "VIEWER"]),
    budgetItemsController.list
);

router.post(
    "/",
    validatedMiddleware.validateParams(budgetIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR"]),
    validatedMiddleware.validateBody(createBudgetItemSchema),
    budgetItemsController.create
);

export default router;
