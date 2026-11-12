import { Router } from "express";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { expensesController } from "../expenses.module.js";
import {
    budgetExpenseParamSchema,
    createExpenseSchema,
    listExpensesQuerySchema,
} from "./validators/expense.schema.js";

const router = Router({ mergeParams: true });
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

router.use(authMiddleware.protegerRuta);

router.get(
    "/",
    validatedMiddleware.validateParams(budgetExpenseParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR", "VIEWER"]),
    validatedMiddleware.validateQuery(listExpensesQuerySchema),
    expensesController.list
);

router.post(
    "/",
    validatedMiddleware.validateParams(budgetExpenseParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR"]),
    validatedMiddleware.validateBody(createExpenseSchema),
    expensesController.create
);

export default router;
