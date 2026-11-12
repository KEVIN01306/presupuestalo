import { Router } from "express";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { expensesController } from "../expenses.module.js";
import { expenseIdParamSchema, updateExpenseSchema } from "./validators/expense.schema.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

router.use(authMiddleware.protegerRuta);

router.put(
    "/:expenseId",
    validatedMiddleware.validateParams(expenseIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR"]),
    validatedMiddleware.validateBody(updateExpenseSchema),
    expensesController.update
);

router.delete(
    "/:expenseId",
    validatedMiddleware.validateParams(expenseIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR"]),
    expensesController.delete
);

export default router;
