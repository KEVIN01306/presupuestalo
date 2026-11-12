import { Router } from "express";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { incomesController } from "../incomes.module.js";
import { budgetIncomeParamSchema, createIncomeSchema } from "./validators/income.schema.js";

const router = Router({ mergeParams: true });
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

router.use(authMiddleware.protegerRuta);

router.get(
    "/",
    validatedMiddleware.validateParams(budgetIncomeParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR", "VIEWER"]),
    incomesController.list
);

router.post(
    "/",
    validatedMiddleware.validateParams(budgetIncomeParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR"]),
    validatedMiddleware.validateBody(createIncomeSchema),
    incomesController.create
);

export default router;
