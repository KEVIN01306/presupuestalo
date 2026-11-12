import { Router } from "express";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { budgetItemsController } from "../budget-items.module.js";
import { itemIdParamSchema, updateBudgetItemSchema } from "./validators/budget-item.schema.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

router.use(authMiddleware.protegerRuta);

router.put(
    "/:itemId",
    validatedMiddleware.validateParams(itemIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR"]),
    validatedMiddleware.validateBody(updateBudgetItemSchema),
    budgetItemsController.update
);

router.delete(
    "/:itemId",
    validatedMiddleware.validateParams(itemIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR"]),
    budgetItemsController.delete
);

export default router;
